# Devin Rule: No Coalesce Writes (CREATE and UPDATE are separate calls)

## Trigger
- Applies to ALL write paths in this repository: HTTP routers, DAL methods,
  services, and any helper that persists entities.

## The Rule

**Never implement a semantic "upsert" that coalesces CREATE and UPDATE into a
single call site / endpoint / helper.**

- The caller (FE form page, CTA handler, MCP tool, internal service) ALWAYS
  knows whether it is creating or updating. CREATE and UPDATE are different
  form pages / CTAs — at worst an `if` on the caller side chooses which API
  to invoke. The BE must never decide "add if missing else update" on behalf
  of a client.
- API endpoints are strictly split:
  - `POST /api/v1/entities/:entity` → create only (conflict → ERR04/ERR05 → 409)
  - `PUT /api/v1/entities/:entity/:uuid` → update only (missing → ERR03 → 404,
    stale version → ERR01 → 409)
- Module DAL methods mirror that split: `add()`/`addMany` and
  `update()`/`updateMany`. No `setByKey`-style find-then-branch write helpers.

## Why

- A coalescing write performs a wasted `SELECT` (find-then-branch) on every
  call, or worse hides an unguarded `INSERT ... ON CONFLICT DO UPDATE` that
  overwrites rows without a version check (optimistic-lock bypass).
- Ambiguity defeats optimistic concurrency: UPDATE requires the
  caller-observed `version`; CREATE has no version. A caller that doesn't
  know which operation it's performing cannot supply correct guard input.
- Auditability: the audit trail must record CREATE vs UPDATE distinctly.

## Sole exception

Machine-to-machine **sync/import** flows whose declared semantics are
"source of truth wins" (e.g. Casdoor sync, bulk imports). These must be
named and documented as sync/import paths (`*Internal`, `*Sync`), must never
be reachable from user-facing API routes, and may only use guarded
mechanics — DAL `upsertMany` is currently PARKED for exactly this reason:
do NOT re-enable it for generic use.

## Forbidden

- `setByKey` / `upsertConfigEntry` / `saveOrUpdate`-style helpers.
- `ON CONFLICT DO UPDATE` (raw or DAL) on user-facing write paths.
- Endpoints that accept "create if absent" semantics implicitly.
