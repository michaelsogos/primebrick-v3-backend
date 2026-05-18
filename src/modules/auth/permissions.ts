/**
 * RBAC registry — single source of truth for permissions and role mappings.
 *
 * Design:
 *   - Each HTTP action declares the EXACT permission(s) it requires
 *     (e.g. `customers:list`, `customers:delete`). The endpoint, not the role,
 *     determines what is needed.
 *   - Role → Permission mappings are stored in the `role_mappings` table (database).
 *     The auth middleware loads these mappings at startup and expands a user's
 *     roles into a flat `Set<Permission>` once per request.
 *   - The RBAC middleware evaluates the array with **OR** semantics by default
 *     (any-of). Use `rbacHandler.all([...])` for AND semantics.
 *   - Roles marked with `is_admin=true` in the database grant ALL permissions
 *     (super-user wildcard).
 *
 * Adding a permission:
 *   1. Append it to the `Permission` constant below.
 *   2. Map it to the relevant role(s) in the `role_mappings` table via the
 *      frontend role-permission management UI (or direct SQL).
 *   3. Reference it from the route via `rbacHandler([Permission.CUSTOMERS_DELETE])`.
 *
 * Two pseudo-permissions exist as sentinels handled directly by the middleware
 * (they are NOT stored in `role_mappings`):
 *
 *   - `Permission.PUBLIC`             → endpoint reachable without a JWT.
 *                                       In GATEWAY mode the gateway-secret
 *                                       header is still verified.
 *   - `Permission.AUTHENTICATED_USER` → any caller with a valid token / valid
 *                                       gateway identity headers passes,
 *                                       regardless of roles. This is the
 *                                       recommended DEFAULT for new endpoints.
 */

export const Permission = {
  // --- Sentinels (not mapped to any role; handled by rbac middleware) ---
  /** Endpoint reachable anonymously. STILL requires gateway-secret in GATEWAY mode. */
  PUBLIC: "_public",
  /** Any caller whose identity has been authenticated, regardless of roles. */
  AUTHENTICATED_USER: "_authenticated_user",

  // --- System / cross-module ---
  MODULES_LIST: "modules:list",

  // --- Customers module ---
  CUSTOMERS_LIST: "customers:list",
  CUSTOMERS_READ: "customers:read",
  CUSTOMERS_CREATE: "customers:create",
  CUSTOMERS_UPDATE: "customers:update",
  CUSTOMERS_DELETE: "customers:delete",
  CUSTOMERS_BULK_DELETE: "customers:bulk-delete",
  CUSTOMERS_RESTORE: "customers:restore",
  CUSTOMERS_BULK_RESTORE: "customers:bulk-restore",
  CUSTOMERS_BULK_DUPLICATE: "customers:bulk-duplicate",
  CUSTOMERS_EXPORT: "customers:export",
  CUSTOMERS_AUDIT_READ: "customers:audit:read",
} as const;

/**
 * `true` when the given permission is a sentinel (PUBLIC / AUTHENTICATED_USER)
 * handled directly by the rbac middleware rather than by role expansion.
 */
export function isPermissionSentinel(p: string): boolean {
  return p === Permission.PUBLIC || p === Permission.AUTHENTICATED_USER;
}

export type Permission = (typeof Permission)[keyof typeof Permission];

/**
 * Expand a list of role names into the union of their granted permissions.
 * This function queries the `role_mappings` table to resolve roles to permissions.
 * Roles marked with `is_admin=true` grant ALL permissions.
 *
 * @param roles - Role names from the IDP (as extracted from JWT via AUTH_ROLES_PATH)
 * @param getAllPermissionsFn - Function that returns all known permissions in the system
 * @param getRoleMappingFn - Function that returns the mapping for a specific role
 * @returns Set of granted permissions
 */
export async function expandPermissions(
  roles: readonly string[],
  getAllPermissionsFn: () => Promise<string[]>,
  getRoleMappingFn: (role: string) => Promise<{ permissions: string[]; is_admin: boolean } | null>
): Promise<Set<string>> {
  const out = new Set<string>();

  for (const r of roles) {
    const mapping = await getRoleMappingFn(r);
    if (!mapping) continue;

    // If role is admin, grant ALL permissions
    if (mapping.is_admin) {
      const allPerms = await getAllPermissionsFn();
      for (const p of allPerms) out.add(p);
    } else {
      // Grant the specific permissions for this role
      for (const p of mapping.permissions) out.add(p);
    }
  }

  return out;
}
