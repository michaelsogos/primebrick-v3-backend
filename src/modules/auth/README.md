# Auth & RBAC module

OAuth2 / OIDC authentication and role-based access control for the Primebrick backend.

## Overview

The module provides:

- **Authentication middleware** (`auth.middleware.ts`) — verifies the caller is who they claim to be
  - `STANDALONE` mode: validates a Bearer JWT against the configured IDP via OIDC discovery + JWKS (`jose` + `openid-client`)
  - `GATEWAY` mode: trusts user-identity headers injected by an upstream API gateway after verifying a shared `X-Gateway-Secret`
- **RBAC middleware** (`rbac.middleware.ts`) — checks the authenticated user has the permissions required by the route
- **IDP-agnostic token normalization** (`token-normalizer.ts`) — extracts roles from any JWT shape using a configurable dotted path (`AUTH_ROLES_PATH`)
- **Internal user mapping** (`user_profile_entity.ts` + `user-profile-repo.ts`) — maps the IDP `sub` claim to a Primebrick-side UUID stored in `public.user_profiles` so that audit columns (`created_by`, `updated_by`, ...) never leak external IDs
- **RFC 7807 errors** for 401 (`UnauthorizedError`) and 403 (`ForbiddenError`) with `extra.issues` carrying the missing permissions

## Required environment variables

Copy these into your local `backend/.env`. **Never commit `.env`.**

```dotenv
# Mode of operation. Mutually exclusive: STANDALONE or GATEWAY.
# STANDALONE: this API validates the Bearer token directly against the IDP.
# GATEWAY:    a trusted reverse proxy (Kong / Tyk / APISIX / Envoy) validates the
#             token and forwards user identity via X-User-* headers.
AUTH_MODE=STANDALONE

# JWT path expression used to extract roles. Defaults to "roles".
# Common values:
#   roles                          (Casdoor, Microsoft Entra)
#   realm_access.roles             (Keycloak realm roles)
#   resource_access.<client>.roles (Keycloak client roles)
AUTH_ROLES_PATH=roles

# --- STANDALONE mode (required) ---------------------------------------------
# Issuer URL used for OIDC discovery: <issuer>/.well-known/openid-configuration
OIDC_ISSUER_URL=http://localhost:8000
OIDC_CLIENT_ID=primebrick-api
OIDC_CLIENT_SECRET=change-me
# Optional: when set, tokens with mismatching `aud` are rejected.
# OIDC_AUDIENCE=primebrick-api

# --- GATEWAY mode (required when AUTH_MODE=GATEWAY) -------------------------
# Shared secret the gateway MUST send via the `X-Gateway-Secret` header.
# Anti-spoofing: without it the API rejects every request with 401.
GATEWAY_SECRET=change-me-too

# Override the names of the user-identity headers if the gateway uses different ones.
# Defaults shown.
# GATEWAY_HEADER_USER_ID=x-user-id
# GATEWAY_HEADER_EMAIL=x-user-email
# GATEWAY_HEADER_NAME=x-user-name
# GATEWAY_HEADER_ROLES=x-user-roles
# GATEWAY_HEADER_IDP_CODE=x-user-idp-code
```

## Bootstrapping Casdoor (local dev)

1. Start the stack:
   ```bash
   docker compose -f infra/docker-compose.postgres.yml up -d
   ```
   Casdoor will be reachable at <http://localhost:8000>. Data is persisted in the
   named volume `primebrick_casdoor_data`, so restarts do **not** wipe it.

2. Open the Casdoor admin UI (`admin / 123` on a fresh install), create an
   application named `primebrick-api`, register the roles (e.g. `Administrators`,
   `CustomersManager`, `CustomersReader` to match `permissions.ts`), and add a user.

3. Copy the application's `clientId` / `clientSecret` into `.env`.

4. Once `OIDC_ISSUER_URL=http://localhost:8000` resolves to a working
   `.well-known/openid-configuration`, run:
   ```bash
   pnpm run db:meta:compare
   pnpm run db:migrate
   ```
   This will create the `public.user_profiles` table.

## Session context propagation (`AsyncLocalStorage`)

To avoid threading `actor: string` through every DAL / service signature, the
auth middleware mirrors the authenticated user into an `AsyncLocalStorage`
store (`session-context.ts`). Any code running on the same async chain can
read it via:

```ts
import { requireActor, getSession } from "../auth/session-context.js";

await this.repo.update(CustomerEntity, uuid, body, requireActor());
```

`requireActor()` throws if called outside an HTTP request and outside
`runAsSystem()` — this is intentional, it makes accidental "fall-back to
system" impossible in user-facing code paths.

For non-HTTP callers (seed scripts, scheduled jobs, migrations) wrap the
entry point:

```ts
import { runAsSystem } from "../auth/session-context.js";

await runAsSystem(() => dal.seedIfEmpty());
```

The store is **not** stored anywhere outside `als.run()`, so V8 reclaims it
together with the request's async resource graph — there is no leak risk
even under high concurrency.

## Wiring an endpoint

All API routes must use `makeProtectedRouter()` which enforces a **declare-first** secure-by-default policy: any route without an `rbacHandler` permission declaration automatically returns 403 with `ROUTE_PERMISSION_NOT_DECLARED`.

```ts
import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "../auth/permissions.js";

const router = makeProtectedRouter();

// Public endpoint (no JWT required, but gateway-secret still verified in GATEWAY mode)
router.get("/api/v1/health", rbacHandler([Permission.PUBLIC]), asyncHandler(async (_req, res) => {
  res.json({ ok: true });
}));

// Authenticated endpoint (any valid token passes, regardless of roles)
router.get("/api/v1/user/profile", rbacHandler([Permission.AUTHENTICATED_USER]), asyncHandler(async (req, res) => {
  res.json({ id: req.user!.id, email: req.user!.email });
}));

// Role-based endpoint (default OR semantics: user needs AT LEAST ONE of the listed permissions)
router.get("/api/v1/entities/customer/list", rbacHandler([Permission.CUSTOMERS_LIST]), asyncHandler(async (req, res) => {
  const result = await getDal().listCustomers(req.query);
  res.json(result);
}));

// AND semantics: user must hold ALL of the listed permissions
router.get("/api/v1/admin/reports", rbacHandler.all([Permission.CUSTOMERS_LIST, Permission.AUDIT_READ]), asyncHandler(async (req, res) => {
  const report = await getDal().generateAuditReport();
  res.json(report);
}));

// DELETE endpoint (no `req.user!.id` plumbing: the DAL pulls the actor from
// AsyncLocalStorage internally via `requireActor()`)
router.delete(
  "/api/v1/entities/customer/:uuid",
  rbacHandler([Permission.CUSTOMERS_DELETE]),
  asyncHandler(async (req, res) => {
    await getDal().deleteCustomer(req.params.uuid);
    res.status(204).send();
  })
);
```

`req.user` is strongly typed (`AuthUser`) thanks to the module augmentation in
`types.ts`. Inside protected routes you can use `req.user!` safely; the auth
middleware guarantees presence and throws `UnauthorizedError` otherwise.

## Adding a permission / role

1. Append the permission to the `Permission` constant in `permissions.ts`.
2. Map it to the relevant role(s) in `ROLE_PERMISSIONS_MAP`.
3. Reference it from the route handler via `rbacHandler([Permission.X])`.

Unknown roles in user tokens are kept on `req.user.roles` (so the application
can read them for display) but grant no permissions unless registered in
`ROLE_PERMISSIONS_MAP`.

## Security notes

- In production, **the API must not be reachable directly from the internet**
  when running in `GATEWAY` mode. It MUST only accept connections from the
  gateway IP range (network isolation), or alternatively use mTLS between the
  gateway and the API.
- The `X-Gateway-Secret` is a defense-in-depth measure, not a substitute for
  network isolation: rotate it periodically.
- The internal Primebrick UUID (`req.user.id`) is the only identifier ever
  written to audit columns. The IDP `sub` (`req.user.idp_code`) is kept for
  observability but should not appear in business records.
- There is **no `DISABLED` auth mode**. Internal scripts (seeds, migrations)
  pass the literal string `"system"` as the actor; this is restricted to
  non-HTTP code paths.
