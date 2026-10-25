# Devin Rule: Test Users — NEVER the dev `admin`

## Trigger
- Applies to ALL tests in this repository (vitest unit/integration,
  `__tests__/` dirs, test helpers, HTTP-level integration tests hitting
  `localhost:3001`) and to `scripts/setup-casdoor.ts`.

## Canonical doc
**`docs/ai/e2e-test-users.md` — read it before acting.** This file is a
pointer; the normative text lives in the canonical doc.

## Enforcement
- `mfa-integration.test.ts` throws when the resolved actor is `admin`.
- Code review / AI agents MUST flag any new `admin` literal used as a test
  identity.
