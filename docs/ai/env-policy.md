# Environment Variable Policy

> `.devin/rules/env-policy.md` is a pointer to this page — canonical text.

## Golden Rule

**The ONLY allowed environment variable is `DATABASE_URL`** (connection
string). Everything else — URLs, ports, secrets, keys, feature flags — is
a **module config** read from the config table (`config_entries` on the
BE, `<schema>.config` via `ConfigLoader` in microservices).
`assertDbEnv()` validates the contract at boot — unknown, missing, empty
or malformed keys crash startup.

**`DATABASE_SCHEMA` is a reserved violation, not a variable.** Schema
identity is **code**: the BE declares `OWNED_SCHEMAS` in
`src/db/owned-schemas.ts` (a leaf module — importable without pulling the
dal-gateway chain) — currently `["public","system","custom"]` with
`public` primary. It feeds the DAL domain, the db-subscriber ownership
gate, and the `db:check`/`db:meta:compare` wrappers. If `DATABASE_SCHEMA`
is present in the process env (`.env`, docker `environment:`)
`assertDbEnv()` **throws** — docker can configure where the database
*is*, never which schemas the service *owns*.

## Why

- Env vars are invisible, un-versioned, and un-audited — config entries are
  managed, audited and consistent across environments.
- Per-service secrets (e.g. `client_key` for the B11 service-identity
  layer) MUST be per-service config rows, so each service holds its own
  key and a leaked key compromises one caller only — never a shared secret
  via env.

## Enforcement

- ❌ NEVER introduce a new `process.env.X` read for a configurable value
  (secrets included — a secret is config, not env).
- ❌ NEVER use env vars for URLs, ports, credentials, client keys, feature
  flags, or anything the service could read from its config table.
- ✅ `DATABASE_URL` is the sole exception — it must exist before the
  config table is readable. `DATABASE_SCHEMA` must NOT exist: it is a
  reserved name — schema identity lives in the `OWNED_SCHEMAS` const
  (`src/db/owned-schemas.ts`), and `assertDbEnv()` throws when it is
  present.
- ✅ When adding a config value: create a config entry (key, type, i18n
  label) in the module's config seed, document it, and read it via
  `ConfigLoader`/`ConfigEntriesService`.
- When reviewing code, flag any new `process.env.` read other than the DB
  connection as a violation.

## Platform variables (process env — never `.env`, never config)

A closed set of **platform** env vars is permitted. They are supplied at
process launch or via Docker `ENV` — never in `.env`, never hardcoded,
never in `config_entries`:

- `NODE_ENV` — `production` enables two security gates:
  - `Secure` session-cookie flag — cookies travel only over HTTPS;
    non-production keeps plain-HTTP local dev working
    (`auth-session.service.ts`)
  - migration signature trust `allowedTrust: ["release"]` —
    non-production accepts both `dev` and `release` signed DB patches
    (`db-migration` engine + `run-module-migrations.ts`)
  The Dockerfile sets `ENV NODE_ENV=production`; local dev leaves it
  unset.
- `PB_<MODULE>_FORCE_EMPTY` / `PB_<MODULE>_FORCE_ERROR` — E2E debug
  toggles consumed by `DomainService.list` (dev/test only).
- `E2E_ADMIN_USERNAME` / `E2E_ADMIN_PASSWORD` — ephemeral E2E actor
  credentials minted per run by the test harness (deleted at teardown).
- Script-level knobs (`CASDOOR_*`, `DB_SCHEMA`-style args in `scripts/`) —
  CLI arguments for bootstrap tooling; they are not runtime config.

The `.env` file itself may contain ONLY `DATABASE_URL` — extra keys crash
`assertDbEnv()` at boot.
