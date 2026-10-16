# Devin Rule: Test Users — NEVER the dev `admin`

## Trigger
- Applies to ALL tests in this repository (vitest unit/integration,
  `__tests__/` dirs, test helpers, HTTP-level integration tests hitting
  `localhost:3001`) and to `scripts/setup-casdoor.ts`.

## Test actors
The FE E2E stack mints an **ephemeral admin actor per run** (random password,
deleted in teardown — see `primebrick-fe-v3/src/e2e/helpers/test-users.ts`).
BE HTTP-level integration tests read the actor credentials from
`E2E_ADMIN_USERNAME` / `E2E_ADMIN_PASSWORD` env vars.

Static privileged test users must NOT be seeded or relied upon — an always-on
admin account is a latent backdoor. Identity fixtures use `test-admin` /
`test-user` as the username string (placeholder identity, not a real account).

## Mandatory rules
1. **NEVER authenticate as the dev bootstrap `admin` user in tests** — not in
   HTTP integration tests, not in fixtures representing "the logged-in user".
   Identity fixtures use `test-admin` / `test-user` (`idp_username`,
   `idp_code`, emails, JWT `clientId` claims, etc.).
2. **NEVER destroy/recreate `admin`'s credentials, secrets, MFA factors, or
   passkeys** to bypass MFA. MFA tests operate on test actors only.
3. **`setup-casdoor.ts` seeds `admin` for human first-login only** — the file
   header documents this; do not add test-actor seeding there.
4. **Exception:** Casdoor's built-in `"admin"` application-owner namespace in
   the Casdoor REST contract (`owner: "admin"` on applications) is NOT the
   admin user — it may stay, and is commented where it appears.

## Enforcement
- `mfa-integration.test.ts` throws when the resolved actor is `admin`.
- Code review / AI agents MUST flag any new `admin` literal used as a test
  identity.
