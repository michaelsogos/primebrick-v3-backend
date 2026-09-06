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
GET    /api/v1/entities/:entity/meta              → entity metadata
GET    /api/v1/entities/:entity/list              → paginated list
GET    /api/v1/entities/:entity/:uuid             → single record
POST   /api/v1/entities/:entity                   → create
PUT    /api/v1/entities/:entity/:uuid             → update
DELETE /api/v1/entities/:entity/:uuid             → soft-delete
POST   /api/v1/entities/:entity/:uuid/restore     → restore
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
