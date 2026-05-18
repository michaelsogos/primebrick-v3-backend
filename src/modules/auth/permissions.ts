/**
 * RBAC registry — single source of truth for permissions and role mappings.
 *
 * Design:
 *   - Each HTTP action declares the EXACT permission(s) it requires
 *     (e.g. `customers:list`, `customers:delete`). The endpoint, not the role,
 *     determines what is needed.
 *   - Roles are defined globally and mapped N:N to permissions via
 *     `ROLE_PERMISSIONS_MAP`. The auth middleware expands a user's roles into
 *     a flat `Set<Permission>` once per request.
 *   - The RBAC middleware then performs an `every()` (AND) check between
 *     required permissions and the user's expanded set.
 *
 * Adding a permission:
 *   1. Append it to the `Permission` union below.
 *   2. Map it to the relevant role(s) in `ROLE_PERMISSIONS_MAP`.
 *   3. Reference it from the route via `rbacHandler([Permission.CUSTOMERS_DELETE])`.
 */

export const Permission = {
  // --- Customers module ---
  CUSTOMERS_LIST: "customers:list",
  CUSTOMERS_READ: "customers:read",
  CUSTOMERS_CREATE: "customers:create",
  CUSTOMERS_UPDATE: "customers:update",
  CUSTOMERS_DELETE: "customers:delete",
  CUSTOMERS_BULK_DELETE: "customers:bulk-delete",
  CUSTOMERS_RESTORE: "customers:restore",
  CUSTOMERS_BULK_RESTORE: "customers:bulk-restore",
  CUSTOMERS_DUPLICATE: "customers:duplicate",
  CUSTOMERS_BULK_DUPLICATE: "customers:bulk-duplicate",
  CUSTOMERS_EXPORT: "customers:export",
  CUSTOMERS_AUDIT_READ: "customers:audit:read",

  // --- Generic entities (catch-all router) ---
  ENTITIES_BULK_DELETE: "entities:bulk-delete",
  ENTITIES_BULK_RESTORE: "entities:bulk-restore",

  // --- Modules / system ---
  MODULES_LIST: "modules:list",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/**
 * Built-in roles. The strings MUST match what the IDP emits in the JWT
 * (after applying `AUTH_ROLES_PATH`) or what the gateway forwards in
 * `X-User-Roles`. Casing matters.
 */
export const Role = {
  ADMINISTRATORS: "Administrators",
  CUSTOMERS_MANAGER: "CustomersManager",
  CUSTOMERS_READER: "CustomersReader",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/**
 * Role → Permission(s) mapping. Order is irrelevant; duplicates are deduplicated
 * at expansion time.
 *
 * NOTE: Unknown roles in the user token are kept in `req.user.roles` (so the
 * application can read them for display) but they grant no permissions unless
 * registered here.
 */
export const ROLE_PERMISSIONS_MAP: Readonly<Record<string, readonly Permission[]>> = {
  [Role.ADMINISTRATORS]: [
    Permission.CUSTOMERS_LIST,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_CREATE,
    Permission.CUSTOMERS_UPDATE,
    Permission.CUSTOMERS_DELETE,
    Permission.CUSTOMERS_BULK_DELETE,
    Permission.CUSTOMERS_RESTORE,
    Permission.CUSTOMERS_BULK_RESTORE,
    Permission.CUSTOMERS_DUPLICATE,
    Permission.CUSTOMERS_BULK_DUPLICATE,
    Permission.CUSTOMERS_EXPORT,
    Permission.CUSTOMERS_AUDIT_READ,
    Permission.ENTITIES_BULK_DELETE,
    Permission.ENTITIES_BULK_RESTORE,
    Permission.MODULES_LIST,
  ],
  [Role.CUSTOMERS_MANAGER]: [
    Permission.CUSTOMERS_LIST,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_CREATE,
    Permission.CUSTOMERS_UPDATE,
    Permission.CUSTOMERS_DELETE,
    Permission.CUSTOMERS_RESTORE,
    Permission.CUSTOMERS_DUPLICATE,
    Permission.CUSTOMERS_EXPORT,
    Permission.CUSTOMERS_AUDIT_READ,
    Permission.MODULES_LIST,
  ],
  [Role.CUSTOMERS_READER]: [
    Permission.CUSTOMERS_LIST,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_EXPORT,
    Permission.CUSTOMERS_AUDIT_READ,
    Permission.MODULES_LIST,
  ],
};

/**
 * Expand a list of role names into the union of their granted permissions.
 * Unknown roles are silently ignored (they grant nothing).
 */
export function expandPermissions(roles: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const r of roles) {
    const perms = ROLE_PERMISSIONS_MAP[r];
    if (!perms) continue;
    for (const p of perms) out.add(p);
  }
  return out;
}
