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
  MODULES_READ_ALL: "modules.read.all",

  // --- Settings / Profile module ---
  PROFILE_READ: "profile.read",
  PROFILE_UPDATE: "profile.update",
  USER_PROFILE_READ_AUDIT: "userprofile.read.audit",

  // --- Customers module ---
  CUSTOMERS_READ_ALL: "customers.read.all",

  CUSTOMERS_READ_SINGLE: "customers.read.single",
  CUSTOMERS_READ_AUDIT: "customers.read.audit",

  CUSTOMERS_CREATE_SINGLE: "customers.create.single",
  CUSTOMERS_CREATE_BULK: "customers.create.bulk",

  CUSTOMERS_UPDATE_SINGLE: "customers.update.single",
  CUSTOMERS_UPDATE_BULK: "customers.update.bulk",

  CUSTOMERS_DELETE_SINGLE: "customers.delete.single",
  CUSTOMERS_DELETE_BULK: "customers.delete.bulk",

  CUSTOMERS_RESTORE_SINGLE: "customers.restore.single",
  CUSTOMERS_RESTORE_BULK: "customers.restore.bulk",

  CUSTOMERS_DUPLICATE_BULK: "customers.duplicate.bulk",

  CUSTOMERS_EXPORT: "customers.export",
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
 * Convert a wildcard pattern to a regex for matching.
 * Supports * wildcard only (no ? or character classes for simplicity).
 * Example: "customers.read.*" → /^customers\.read\..*$/
 */
function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const wildcardPattern = escaped.replace(/\*/g, '.*');
  return new RegExp(`^${wildcardPattern}$`);
}

/**
 * Check if a permission string matches a pattern (supports * wildcard).
 * @param pattern - Pattern with optional * wildcard (e.g., "customers.read.*")
 * @param permission - Permission string to match (e.g., "customers.read.single")
 * @returns true if permission matches pattern
 */
export function matchesWildcard(pattern: string, permission: string): boolean {
  if (!pattern.includes('*')) {
    // No wildcard - exact match
    return pattern === permission;
  }
  const regex = wildcardToRegex(pattern);
  return regex.test(permission);
}

/**
 * Check if a permission is granted given a set of user permissions.
 * Supports wildcard patterns in user permissions.
 * @param userPermissions - Set of permissions granted to user (may contain wildcards)
 * @param requiredPermission - Permission required by the endpoint
 * @returns true if permission is granted
 */
export function isPermissionGranted(userPermissions: Set<string>, requiredPermission: string): boolean {
  // Check exact match first (fast path)
  if (userPermissions.has(requiredPermission)) {
    return true;
  }

  // Check wildcard patterns
  for (const userPerm of userPermissions) {
    if (userPerm.includes('*') && matchesWildcard(userPerm, requiredPermission)) {
      return true;
    }
  }

  return false;
}

/**
 * Expand a list of role names into patterns and admin status.
 * This function queries the `role_mappings` table to resolve roles to permissions.
 * Roles marked with `is_admin=true` bypass all permission checks.
 *
 * @param roles - Role names from the IDP (as extracted from JWT via AUTH_ROLES_PATH)
 * @param getRoleMappingFn - Function that returns the mapping for a specific role
 * @returns Object with patterns array and isAdmin flag
 */
export async function expandPermissions(
  roles: readonly string[],
  getRoleMappingFn: (role: string) => Promise<{ permissions: string[]; is_admin: boolean } | null>
): Promise<{ patterns: string[]; isAdmin: boolean }> {
  const patterns = new Set<string>();
  let isAdmin = false;

  for (const r of roles) {
    const mapping = await getRoleMappingFn(r);
    if (!mapping) continue;

    // If any role is admin, set isAdmin flag
    if (mapping.is_admin) {
      isAdmin = true;
    }

    // Add all patterns from this role (ignored if isAdmin=true, but we collect them anyway)
    for (const p of mapping.permissions) patterns.add(p);
  }

  return { patterns: Array.from(patterns), isAdmin };
}
