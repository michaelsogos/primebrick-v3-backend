# AI AGENT INSTRUCTIONS - Primebrick Backend

## ⚠️ CRITICAL: NEVER COMMIT AUTOMATICALLY

**AI agents MUST NEVER commit changes without explicit user instruction.**

- **WAIT for the user to explicitly tell you to commit** before running any `git commit` command
- This applies to ALL situations - no exceptions
- See [docs/gitflow.md](./docs/gitflow.md) for complete GitFlow rules including commit rules

## Repository overview

Independent Git repository containing the Primebrick API, database, and endpoints.

**Documentation language:** All `*.md` files must use **English** for team-facing prose.

**Mandatory infrastructure:** PostgreSQL® (database), Redis™ (cache + WebAuthn session
relay + presence), NATS™ (service registry + collaboration), Casdoor™ (IDP). The
`/api/v1/health` endpoint returns 503 when ANY of these are down. Redis-dependent
endpoints (e.g. WebAuthn passkey signin) return `503 + REDIS_UNAVAILABLE` when Redis
is unavailable.

## CI / Deployment

**This repo has NO auto-deploy CI. Deployment follows GitFlow.**

Pushing to `develop` or feature branches is fine for development, but deployment
only happens when a release branch is created, closed, and merged to `main` with
a version tag. There is no CI pipeline that auto-deploys on push.

### Primebrick CI/Deployment overview (all repos)

| Repo | CI/Deployment | Process to deploy |
|------|--------------|-------------------|
| **primebrick-v3-backend** (this repo) | No auto-deploy CI | GitFlow: create release branch → close → merge to `main` + tag |
| **primebrick-v3-frontend** (FE) | No auto-deploy CI | GitFlow: create release branch → close → merge to `main` + tag |
| **primebrick-v3-microservices** (US) | No auto-deploy CI | GitFlow: create release branch → close → merge to `main` + tag |
| **primebrick-v3-sdk** (SDK) | GitHub™ Actions | GitFlow: create release → close → merge to `main` + tag → CI publishes to npm |
| **primebrick-v3-dal** (DAL) | GitHub™ Actions | GitFlow: create release → close → merge to `main` + tag → CI publishes to npm |
| **primebrick-v3-docs** | Cloudflare® Worker CI | Push to `main` — auto-deploys |
| **primebrick-v3-website** | Cloudflare® Worker CI | Push to `main` — auto-deploys |

## Commands

| Action | Command |
|--------|---------|
| Install | `pnpm install` |
| Dev API | `pnpm run dev` |
| Build | `pnpm run build` |
| Entity ↔ DB compare (generates snapshots / patch files when models drift) | `pnpm run db:meta:compare` |
| Apply DB patches (migrations registry) | `pnpm run db:migrate` |
| Seed demo customers | `pnpm run db:seed:customers` |

### Postgres (Docker®)

- Up: `docker compose -f infra/docker-compose.postgres.yml up -d`
- Down: `docker compose -f infra/docker-compose.postgres.yml down`

### Dev server

Uses **`tsx watch`** — do **not** start a second instance on port **3001** (`EADDRINUSE`). If the user already runs the API, test against `http://localhost:3001` instead of spawning another server.

If **you** started `pnpm run dev` only to verify, **stop it** when done. Do not kill the user’s dev server without asking.

## Conventions

- Small, focused changes; readable migrations/patches.
- No secrets in git (`.env`, credentials).
- **Team-facing `*.md`:** English only.
- **API errors:** Use stable error codes with `impact` field for the frontend.
- **Translation keys:** MUST be snake_case singular — see [`.devin/rules/translation-key-convention.md`](./.devin/rules/translation-key-convention.md). Every meta file MUST include a `translationKey` field (snake_case singular) alongside `entity` (snake_case plural). All `labelKey`/`titleKey`/`tooltip` values MUST use the `translationKey` as the entity segment.

### Schema diff safety

If `db-meta/diff-entities-vs-database.json` has `renameHeuristicUserReviewRequired: true`, **ask the user** before applying heuristic renames.

### Database patches vs migrations

- **`pnpm run db:meta:compare`** — run when **entity / model code** changes. It refreshes JSON snapshots and may add a new file under `db-meta/patches/`. Do **not** wire this to **post-merge** (it is not a migration runner).
- **`pnpm run db:migrate`** — applies pending `.sql` files in order, using `public.primebrick_database_patches` (patch_id + `content_sha256`) so already-applied files are skipped and the first missing patch is applied next.

### Patch SHA256 management

If `db:migrate` fails with "exists in registry with a different content_sha256", see
[.devin/rules/patch-sha256-management.md](./.devin/rules/patch-sha256-management.md).
**Never create a new initial patch** — update the existing `00000000000000_init_database.sql`
in place and create a fire-and-forget script to update the registry hash on existing databases.

### Git hooks (optional)

From this repository root:

```bash
git config core.hooksPath .githooks
```

- **`post-merge`** runs **`pnpm run db:migrate`** only (skips if `DATABASE_URL` is unset and there is no `.env`). Set **`PB_SKIP_POST_MERGE_DB_MIGRATE=1`** to skip. Remove any local hook that runs `db:meta:compare` on merge — that belongs to model-change workflows, not pull/merge.

## GitFlow rules

This repository follows GitFlow. AI agents MUST follow these rules.

**See [docs/gitflow.md](./docs/gitflow.md) for complete GitFlow rules, branch management, closing procedure, version tagging, and commit rules.**

## Package Versioning — FIXED versions only (MANDATORY)

All package versions in `package.json` MUST be pinned to exact versions (e.g.
`"typescript": "5.9.3"`). NO ranges (`^`, `~`, `>=`, `*`, `latest`) are allowed
for registry packages. This ensures every dev machine, CI build, and production
rebuild gets the exact same dependency tree that was tested during UAT.

See [.devin/rules/package-versioning.md](./.devin/rules/package-versioning.md)
for the full rule and upgrade procedure.

## Config Table Standard (`auth_configurations`)

The `auth_configurations` table is the canonical Config Table standard for
Primebrick. It stores key/value configuration rows with metadata that drives
both BE validation and FE widget selection.

### Schema

| Column | Type | Description |
|--------|------|-------------|
| `key` | varchar(100) NOT NULL | Unique config key (e.g. `oidc_issuer_url`) |
| `value` | text nullable | Config value (always TEXT — type conversion at read time) |
| `type` | varchar(50) NOT NULL | Config value type (see `ConfigType` in SDK) |
| `type_config` | text nullable | JSONB-text extra per-type config (badge inline values, list API URL, etc.) |
| `label_key` | varchar(100) nullable | i18n key for the setting title |
| `description_key` | varchar(100) nullable | i18n key for the explanatory description |
| `reserved` | boolean NOT NULL DEFAULT false | If true, the row is system-critical: editable but not deletable |
| `group_key` | varchar(100) nullable | UI grouping key (null/empty = ungrouped, top of list). DAL sorts by `group_key ASC, key ASC`. |
| audit + soft-delete fields | — | Standard `@AuditTrail()` + `@DeletableField()` columns |

### Config types

| Type | FE widget | BE validation |
|------|-----------|---------------|
| `string` | text input | none |
| `text` | textarea | none |
| `boolean` | switch | must be `"true"` or `"false"` |
| `bigint` | numeric input | must be an integer (coerced to JS `BigInt`) |
| `number` | numeric input | must be a number (coerced to JS `Number`) |
| `money` | numeric input + currency symbol | must be a number (amount is JS `Number`, currency in `type_config`) |
| `badge` | ComboSelect (inline values from `type_config.values`) | must be in `type_config.values` |
| `list` | ComboSelect (options loaded from `type_config.api_url`) | none (validated by the BE catalog code) |
| `url` | URL input | must be a valid URL |
| `secret` | password input (masked) | none (empty string = "leave unchanged") |
| `json` | textarea | must be valid JSON |
| `date` | DateWheelPicker | none (format validated by FE) |
| `datetime` | DateWheelPicker (includeTime) | none (format validated by FE) |
| `time` | native time input | none (format validated by FE) |

The conceptual type `"integer"` was renamed to `"bigint"` to make the
backing JS type explicit. Existing rows are migrated by a fire-and-forget
SQL patch (`rename_integer_to_bigint_config_type.sql`).

The `money` type is a primitive numeric display type — the amount is a
JS `Number`, and currency metadata is stored in `type_config`. There is
no `Money` composite wire type.

### `type_config` JSON shapes

**money:**
```json
{ "currency": "EUR" }
```

**badge:**
```json
{
  "values": {
    "value1": { "label_key": "i18n.key.for.value1", "color": "primary" },
    "value2": { "label_key": "i18n.key.for.value2", "color": "destructive" }
  }
}
```

**list:**
```json
{
  "api_url": "/api/v1/system/roles/active",
  "api_verb": "GET",
  "value_field": "idp_role",
  "label_field": "label_key"
}
```

### CRUD endpoints

All endpoints are admin-only (`AUTHENTICATED_ADMIN`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/entities/config_entries/meta` | Entity metadata |
| GET | `/api/v1/entities/config_entries/list` | All rows (secrets masked to `null`) |
| GET | `/api/v1/entities/config_entries/:uuid` | Single row (secret masked) |
| PUT | `/api/v1/entities/config_entries/:uuid` | Update value (validates type) |
| DELETE | `/api/v1/entities/config_entries/:uuid` | Soft-delete (reserved rejected, step-up MFA) |
| POST | `/api/v1/entities/config_entries/bulk-delete` | Bulk soft-delete (reserved rejected, step-up MFA) |
| POST | `/api/v1/entities/config_entries/:uuid/restore` | Restore soft-deleted row |

### Security

- **Reserved rows** are editable but cannot be deleted (returns 403 with
  `internal_code: "reserved_config_cannot_be_deleted"`).
- **Reserved rows** cannot change `type` or `type_config` (returns 403 with
  `internal_code: "reserved_config_type_cannot_change"`). Only `value` is
  updatable for reserved rows.
- **Non-reserved rows** allow `value`, `type`, and `type_config` updates.
- **Delete and bulk-delete** require step-up MFA (X-MFA-Action-Authorization header).
- **Secret values** are masked to `null` in API responses. An empty PUT body
  for a secret means "leave unchanged".
- **Writes** invalidate and reload the in-memory auth configuration cache.
- **Typed values** are coerced at the SDK/BE boundary: `bigint` values
  become native `bigint`, `number`/`money` values become `number`. The BE
  serializes typed input via `serializeConfigValue()` before storing it in
  the text `value` column, and coerces values before returning them to the FE.
- **Request bodies** are parsed with the SDK's BigInt-safe `extJsonBodyParser()`
  (replaces `express.json()`) so that large integer values preserve precision.

### Files

- Entity: `src/modules/auth/auth_configuration_entity.ts`
- DAL: `src/modules/auth/auth_configurations_dal.ts`
- Router: `src/modules/auth/routers/config-entries.router.ts`
- Meta: `src/modules/auth/config-entries.meta.ts`
- DB patch: `db-meta/patches/00000000000000_init_database.sql`
- Migration: `db-meta/fire-and-forget/add_config_table_standard_columns.sql`

## Further documentation

See `docs/ai/` for skills selection and suggested workflows.

## RBAC Permission System

### Architecture

The backend uses a wildcard-based RBAC system with pattern matching:

- **Source of truth**: `Permission` enum in `src/modules/auth/permissions.ts` defines all available permissions
- **Role mappings**: Stored in `role_mappings` table (columns: `idp_role`, `permissions` array, `is_admin` boolean)
- **Permission format**: Dot notation with wildcards (e.g., `customers.read.*`, `customers.read.single`)
- **Admin bypass**: Users with `is_admin=true` bypass all permission checks.
  For high-risk non-CRUD operations that must be **explicitly** admin-only
  (not just bypassed), use the `Permission.AUTHENTICATED_ADMIN` sentinel.
  This sentinel requires `req.user.isAdmin === true` and must appear alone
  in the permission array (same rule as `PUBLIC` and `AUTHENTICATED_USER`).
  Example: `POST /api/v1/entities/user_profiles/:uuid/change-password`.

### Permission Structure

Permissions follow the pattern: `module.action.granularity`

Examples:
- `customers.read.all` - List all customers
- `customers.read.single` - Read single customer
- `customers.read.audit` - Read customer audit trail
- `customers.create.single` - Create single customer
- `customers.create.bulk` - Bulk create customers
- `customers.update.single` - Update single customer
- `customers.update.bulk` - Bulk update customers
- `customers.delete.single` - Delete single customer
- `customers.delete.bulk` - Bulk delete customers
- `customers.restore.single` - Restore single customer
- `customers.restore.bulk` - Bulk restore customers
- `customers.duplicate.bulk` - Bulk duplicate customers
- `customers.export` - Export customers
- `modules.read.all` - List all modules

### Wildcard Support

- `customers.*` matches all customer permissions
- `customers.read.*` matches all customer read permissions
- `*` matches everything (equivalent to admin)

### Role Mappings (Casdoor™ Integration)

The system is integrated with Casdoor™ IDP. Role names must match Casdoor™ roles (snake_case):

- `administrators` - Admin role (`is_admin=true`, bypasses all checks)
- `collaborator` - Full access to customers (`permissions: ["customers.*"]`)
- `guest` - Read-only access (`permissions: ["customers.read.*"]`)

### Implementation Details

**Files:**
- `src/modules/auth/permissions.ts` - Permission enum and pattern matching logic
- `src/modules/auth/rbac.middleware.ts` - RBAC middleware with admin bypass
- `src/modules/auth/auth.middleware.ts` - Auth middleware with permission expansion
- `src/modules/auth/role-mapping-repo.ts` - Role mapping repository
- `src/modules/auth/types.ts` - AuthUser type with `isAdmin` field

**Key functions:**
- `expandPermissions(roles, getRoleMappingFn)` - Returns `{ patterns, isAdmin }`
- `isPermissionGranted(userPermissions, requiredPermission)` - Pattern matching with wildcard support
- `matchesWildcard(pattern, permission)` - Converts wildcard to regex for matching

**RBAC Middleware Flow:**
1. Check if `req.user.isAdmin` is true → bypass all checks
2. For non-admin users, use pattern matching on `req.user.permissions`
3. Support both "any" (OR) and "all" (AND) modes

### Adding New Permissions

1. Add permission constant to `Permission` enum in `permissions.ts`
2. Use the permission in route handlers via `rbacHandler([Permission.NEW_PERMISSION])`
3. Update role mappings in database to grant the permission (or use wildcard)
4. No need to update `getAllPermissions` - source of truth is the enum

### Testing

When testing RBAC changes, ensure the role mapping cache is reloaded by restarting the backend server after database updates.

## User-facing documentation

User-facing developer documentation lives in `docs/user-guide/` as MDX files.
These are synced to `docs.primebrick.dev` by the docs repo's CI pipeline.

- **Location**: `docs/user-guide/*.mdx` — one file per topic
- **Ordering**: `docs/user-guide/_order.json` defines the sidebar page order
- **Conventions**: see `.devin/rules/docs-user-guide.md` for editorial rules
- **Mermaid**: use `<Mermaid chart={...} />`, never ` ```Code ` or ` ```mermaid `
- **Do NOT hand-edit** files in `docs/ai/` or `docs/skills/` — those are internal
- **Internal docs** (`docs/ai/`, `docs/skills/`, `docs/gitflow.md`) are NOT synced
  to the docs site — they stay in this repo for AI agents only
