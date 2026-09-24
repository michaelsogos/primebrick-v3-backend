# Devin Rule: API Path Conventions

## Trigger
- Applies to ALL code in this repository that defines HTTP routes, OpenAPI specs,
  or route handlers.

## Purpose

Establish a single, documented standard for BE endpoint paths, entity class
names, PG table names, and translation key names.

## Endpoint categories

Every HTTP endpoint falls into exactly ONE of these categories:

| Category | Path prefix | API style | Purpose |
|---|---|---|---|
| **Entity CRUD** | `/api/v1/entities/:entity/...` | RESTful CRUD | Standard lifecycle operations on database-backed entities |
| **Auth RPC** | `/api/v1/auth/...` | RPC | Authentication, session, MFA, WebAuthn |
| **System RPC** | `/api/v1/system/...` | RPC | BE-internal infrastructure, config, runtime reads, health, OpenAPI |
| **MCP** | `/mcp/...` | Tool protocol | AI tool-calling protocol (OAuth + transport) |
| **Webhooks** (US only) | `/webhook/...` | RPC | External callbacks |
| **Well-known** | `/.well-known/...` | RPC | Protocol-mandated discovery (OAuth, etc.) |

- **SYSTEM is the default module** for BE-internal RPC endpoints (including
  health and OpenAPI). AUTH is a separate module for authentication. ENTITIES
  is for RESTful CRUD only. MCP is a distinct tool-calling protocol for AIs.
- **MCP exception:** `.well-known` URLs are protocol-mandated at the root,
  everything else under `/mcp/...`. MCP is NOT AUTH, NOT RPC, NOT CRUD.
- **Modules endpoint exception:** `/api/v1/modules` is currently at the root
  level — documented as a known deviation to be fixed in a future PR (move to
  `/api/v1/system/modules`).

## Entity CRUD standard verbs

```
GET    /api/v1/entities/:entity/meta              → entity metadata (+ derived `actions` array — see note)
GET    /api/v1/entities/:entity/list              → paginated list
GET    /api/v1/entities/:entity/:uuid             → single record
POST   /api/v1/entities/:entity                   → create
PUT    /api/v1/entities/:entity/:uuid             → update
DELETE /api/v1/entities/:entity/:uuid?version=N   → soft-delete (version required)
POST   /api/v1/entities/:entity/:uuid/restore     → restore (entity body must carry version)
GET    /api/v1/entities/:entity/:uuid/audit       → audit history
POST   /api/v1/entities/:entity/bulk-delete       → bulk soft-delete
POST   /api/v1/entities/:entity/bulk-restore      → bulk restore
POST   /api/v1/entities/:entity/bulk-update       → bulk update
POST   /api/v1/entities/:entity/duplicate         → bulk duplicate
GET    /api/v1/entities/:entity/export            → streamed export
GET    /api/v1/entities/:entity/aggregate         → aggregate query
GET    /api/v1/entities/:entity/check-availability → uniqueness check
POST   /api/v1/entities/:entity/:uuid/:action     → entity-scoped action
```

`:entity` is always snake_case **singular**.

**Bulk routes are per-entity opt-in, NOT universal.** `bulk-delete`,
`bulk-restore`, `bulk-update`, `duplicate`, and `export` exist only where the
entity router explicitly registers them. A bulk op is an atomic set operation
(single transaction / temp-table strategy) — NOT a loop of single writes.
Entities whose writes must sync to an external system per record (e.g.
`organization` → Casdoor via per-org `idp_code`) architecturally CANNOT expose
bulk routes: a loop of single deletes is not a bulk op. `organization`
therefore registers no bulk routes — mandatory, do NOT add them. Because
`meta.actions` is derived from the route table, absent bulk routes
automatically hide the corresponding CTAs — do NOT add overrides or fake ops
to work around this.

**Optimistic concurrency & write responses:**

- Single writes (`POST`, `PUT`, `DELETE`, `restore`) return **200 + the
  `RETURNING` row** — the FE/MCP caller MUST consume the response entity
  (it carries the incremented `version`); never re-fetch after a write.
- `DELETE` requires `?version=` (query param); `restore` requires `version`
  in the `{entity}` body. A stale/missing version → **409 ERR01**.
- `update`/`delete`/`restore` never re-read the row for the response — the
  DAL `RETURNING` row is the authoritative post-write state.
- Bulk endpoints (`bulk-*`) keep the **204** contract — no body, per-item
  outcomes only where the API explicitly returns them.

## Write-payload standard (`{entity}` envelope)

Single-entity `POST`/`PUT` bodies MUST be wrapped — the entity fields live
under `entity`, never flat at the body root:

```ts
{ entity: EntityPayload, translations?: { key, language, value }[] }
```

- Flat legacy bodies are rejected (hard break — no compatibility shim).
- The wrapper is built by `entityWriteBody(entitySchema)` /
  `entityOnlyWriteBody(entitySchema)` in `src/http/entity-write.ts`, which
  reuse the existing Zod entity schemas unchanged — all field validations and
  `superRefine` rules still apply, now under the `entity.*` error path.
- A non-empty `translations` array requires `TRANSLATIONS_MANAGE` and is
  persisted in the same transaction as the entity write.
- `/api/v1/entities/translation` uses `entityOnlyWriteBody` — a `translations`
  sibling there is rejected.
- **Bulk/action endpoints are exempt** (`bulk-*`, `duplicate`, `restore`):
  they already use stream/temp-table atomicity and keep their own bodies.
- FE callers use `EntityWritePayload<E>` (`src/lib/api-types.ts`); the MCP
  proxy dispatch wraps tool args into `{ entity }` for microservice writes.

Notes on accepted extensions:

- **Sub-actions** on a single row use `POST /api/v1/entities/:entity/:uuid/:action`
  (e.g. `change-password`, `restore`); collection-level actions use
  `/api/v1/entities/:entity/:action` (e.g. `check-availability`, `duplicate`).
- **Verb nuance:** `bulk-update` may use `PUT` instead of `POST` when the
  operation is idempotent full-field replacement (config_entry uses PUT).
- **Domain orchestration routes** (`/api/v1/auth/users`, `/api/v1/auth/invitations/*`)
  are NOT entity-row CRUD — they orchestrate identity lifecycle across IDP +
  local DB and legitimately live under the `auth` namespace. Do not migrate
  them into `/entities/`.
- `/api/v1/system/role-mappings*` is a **documented legacy surface** keyed by
  `idp_role` (not uuid) used by FE role-mapping forms. The canonical CRUD is
  `/api/v1/entities/role_mapping/*`.

## MFA challenge lifecycle

Login MFA is a two-step public flow:

```
POST /api/v1/auth/login                  → mfa_required + mfa_challenge_token (PUBLIC)
POST /api/v1/auth/mfa/challenge/refresh  → swap stale challenge for a fresh one (PUBLIC)
POST /api/v1/auth/mfa/verify             → verify TOTP, set auth cookies (PUBLIC)
```

- The challenge is an HS256 JWT (`jti` keys a **Redis token stash** —
  `mfa:challenge:{jti}` via `CachePort`, 5-min TTL, single-use — popped on
  successful verify). If Redis is unavailable the stash falls back to an
  in-memory Map (single-instance only).
- `challenge/refresh` verifies the old token's **signature only** (`exp`
  ignored — see `verifyMfaChallengeTokenSignature` in
  `src/modules/auth/mfa-challenge-token.ts`), moves the stash to a new `jti`
  with a **fresh TTL**, and mints a fresh challenge. Gone stash
  (consumed/TTL'd) → `401 MFA_CHALLENGE_EXPIRED`; the FE must then fall back
  to password login.
- The FE calls refresh **every time the OTP form mounts** — a challenge token
  must never be assumed fresh after a reload, HMR, or idle wait.
- Step-up MFA (`step-up/initiate` + `step-up/verify`) is session-gated and
  always mints a fresh challenge on open — no refresh needed there.

## `/meta` actions contract

Every entity `meta` response MUST include `actions`, derived by
`deriveEntityActions(router, entity, overrides, extraScans?)`
(`src/http/entity-actions.ts`) from the registered route table — never
hand-written. `*.meta.ts` may only carry `actions_overrides` (visibility
`enabled` toggles). Ops outside the `/entities/` prefix (e.g.
`/api/v1/auth/users`) are folded in via `extraScans` — see
`userProfilesRouter(users)` in `src/modules/auth/router.ts`.

## Naming convention

| Layer | Name form | Rationale | Example |
|---|---|---|---|
| PG table | snake_case **plural** | Table = collection of rows (array) | `customers`, `user_profiles` |
| TS/Node entity class | PascalCase **singular** | Class = schema of ONE row | `CustomerEntity`, `UserProfileEntity` |
| TS/Node interface/type | PascalCase **singular** | Type = schema of ONE row | `Customer`, `UserProfile` |
| API URL entity segment | snake_case **singular** | URL identifies a resource type (singular) | `/api/v1/entities/customer/...` |
| Translation key entity segment | snake_case **singular** | Already established by FE rule | `entities.customer.title` |
| Meta file `entity` field | snake_case **singular** | Matches URL | `entity: "customer"` |
| Meta file `translationKey` field | snake_case **singular** | Matches i18n key | `translationKey: "customer"` |

## What NOT to do

- ❌ Entity class = plural (`CustomersEntity`) — always singular
- ❌ PG table = singular (`customer`) — always plural
- ❌ URL entity segment = plural (`/api/v1/entities/customers`) — always singular
- ❌ Entity routes outside `/api/v1/entities/` prefix
- ❌ AUTH and SYSTEM mixed with CRUD verbs
- ❌ MCP endpoints under `/api/v1/auth/...` or any other prefix — MCP stays under `/mcp/...`

## Entity write payload standard — `{ entity, translations? }`

Entity create/update endpoints that may carry user-created translation rows
use a two-part body. `translations` is OPTIONAL: when absent, only the entity
write runs.

```json
{
  "entity": { "key": "my_key", "value": "...", "type": "string" },
  "translations": [
    { "key": "custom.config.my_key.errors.min", "language": "en-GB", "value": "Too short" }
  ]
}
```

Rules:

- The entity insert/update AND every translation row run in **one database
  transaction** (`runInTransaction` from `primebrick-dal-v3`) — all-or-nothing.
- Translation inserts inside the tx MUST pass `createIfAbsent: false`
  (`INSERT … ON CONFLICT DO NOTHING`, statement-level idempotency): a
  duplicate `(key, language)` must never abort the atomic write — first
  writer wins.
- Updates keep optimistic locking: a version conflict raises `ERR01`, rolls
  the whole tx back, and surfaces as **409 RFC7807** (`urn:primebrick:err01`).
- Piggybacked translation writes require `TRANSLATIONS_MANAGE`, same as the
  standalone translation endpoints.
- Cache invalidation (Redis `translations:i18n:*`) runs **after commit only**,
  covering every module the translation rows actually target.
- Dal write methods accept an optional `tx?: PoolClient`; when present the
  commands run on the transaction instead of the pool.

## Enforcement

- AI agent MUST use the `/api/v1/entities/:entity/...` pattern for ALL
  new entity CRUD routes.
- AI agent MUST use snake_case **singular** for the `:entity` path segment.
- AI agent MUST NOT create entity routes outside the `/api/v1/entities/` prefix.
- AI agent MUST NOT move MCP endpoints under any other prefix.
- AI agent MUST use PascalCase **singular** for entity class names.
- AI agent MUST use snake_case **plural** for `@Entity` table names.
- When reviewing existing code, flag any plural entity segments in URLs as
  violations (deferred fixes documented in the endpoint taxonomy plan).
