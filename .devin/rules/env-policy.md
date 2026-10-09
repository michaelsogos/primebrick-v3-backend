# Devin Rule: Environment Variable Policy

## Trigger
- Applies to ALL code in this repository that reads `process.env` or defines
  configuration.

## Golden Rule

**The ONLY allowed environment variable is the database connection string**
(`DATABASE_URL` / equivalent bootstrap). Everything else — URLs, ports,
secrets, keys, feature flags — is a **module config** read from the config
table (`config_entries` on the BE, `<schema>.config` via `ConfigLoader` in
microservices).

## Why

- Env vars are invisible, un-versioned, and un-audited — config entries are
  managed, audited and consistent across environments.
- Per-service secrets (e.g. `client_key` for the B11 service-identity layer)
  MUST be per-service config rows, so each service holds its own key and a
  leaked key compromises one caller only — never a shared secret via env.

## Enforcement

- ❌ NEVER introduce a new `process.env.X` read for a configurable value
  (secrets included — a secret is config, not env).
- ❌ NEVER use env vars for URLs, ports, credentials, client keys, feature
  flags, or anything the service could read from its config table.
- ✅ `DATABASE_URL` (or the DB connection bootstrap) is the sole exception —
  it must exist before the config table is readable.
- ✅ When adding a config value: create a config entry (key, type, i18n
  label) in the module's config seed, document it, and read it via
  `ConfigLoader`/`ConfigEntriesDal`.
- When reviewing code, flag any new `process.env.` read other than the DB
  connection as a violation.
