# Devin Rule: DAL Usage — ONE way only

## Trigger
- Applies to ALL database access in this repository.

## The rule

There is exactly ONE public API for database access: **`getDal()`** from
`@primebrick/dal-pg` (initialized once in `src/db/dal-gateway.ts` /
`<us>/src/db/dal.ts`).

Consumers (services, modules, controllers-via-services) MUST:
- import `getDal` from `@primebrick/dal-pg` (or the repo's `db/dal.ts`
  re-export);
- use `Repository`/`Dal` methods — `findAll`, `find`, `add`, `update`,
  `delete`, `restore`, `query`;
- receive `Dal`/`Repository`/`PoolClient` (tx) via parameters or the
  singleton — never construct their own connection.

Consumers MUST NOT:
- import `pg`, `pg.Pool`, `PoolClient` directly outside `src/db/`;
- call `getPool()` outside `src/db/` — it is INTERNAL to the infra layer
  (needed only to construct dal-pg `Repository` instances and the
  `BeAuditPortAdapter`); it is not a consumer API;
- create `new Pool()`, `new Client()`, or raw `pool.query` calls;
- bypass dal-pg's `Repository` for entity reads/writes.

## Library authoring (enforced by visibility)

- `src/db/pool.ts` `getPool()` exists for the infra layer only
  (`repository-factory.ts`, audit adapters). Application code importing it
  outside `src/db/` is a violation.
- TS visibility: infra internals stay `private`/module-local; consumers get
  only `getDal`. New helpers that would leak `pg` types must NOT be exported
  from public barrels.
- Lint/CI check: `pg` imports outside `src/db/` should fail review.

## Audit vs events (do NOT conflate)

- **Audit trail** — the persistent `{table}_audit` row written by dal-pg's
  `AuditPort` on write/delete/restore. Same contract in BE and every US.
- **Entity-changed event** — the *event-sourcing/binding* signal emitted in
  parallel to the write so any service can intercept it (NATS
  `entity.<entity>.<action>` / Redis marker). The BE's audit adapter happens
  to publish that marker — it is a separate concern layered on the same hook.
- **Collaboration/SSE** — a CONSUMER of the entity-changed event, nothing to
  do with audit itself.

## Translations (per-module schema)

- `public.translations` = `app.*` keys (global). `system.translations` =
  `system.*` keys. Each microservice module owns `<schema>.translations`.
- BE manages CRUD over all module translation tables via its central
  translations gateway; modules read `app.*` globally and pull their own
  module table down to the BE on first module load.
- Key prefixes are authoritative: `app.*` must never live in
  `system.translations`, `system.*` must never live in `public.translations`
  (drift detected 2026-10-09 — see plan
  `ai-ownership-migration-and-nats-transport.md`).
