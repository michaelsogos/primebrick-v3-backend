/**
 * Authenticated user context attached to every authorized HTTP request.
 *
 * Identity model:
 *   - `id`         → internal Primebrick user UUID (from `user_profiles.uuid`)
 *                    NEVER the IDP `sub` claim. Exposing only the internal UUID
 *                    isolates us from IDP changes (Casdoor → Keycloak → Entra) and
 *                    avoids leaking external identifiers.
 *   - `idp_code`   → original IDP subject (the JWT `sub`). Kept for traceability
 *                    only; should NOT be stored on business audit fields.
 *   - `roles`      → normalized role names from the IDP token (or gateway header).
 *   - `permissions`→ flattened set of permissions derived from `roles` via
 *                    `ROLE_PERMISSIONS_MAP`. Computed once per request by the
 *                    auth middleware and reused by every RBAC check.
 */
export type AuthUser = {
  /** Internal Primebrick UUID. Use this for `created_by` / `updated_by` etc. */
  id: string;
  /** Original IDP subject (JWT `sub`). Read-only audit/log purposes. */
  idp_code: string;
  email: string | null;
  name: string | null;
  roles: string[];
  /** Flattened set of permissions granted by `roles`. */
  permissions: Set<string>;
};

/**
 * Express module augmentation: makes `req.user` strongly typed across the
 * codebase so callers can drop `(req as any).user` casts.
 *
 * `user` is OPTIONAL because some routes (health, OIDC discovery callback,
 * static assets) are mounted before the auth middleware. Inside protected
 * routes the middleware guarantees presence.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
