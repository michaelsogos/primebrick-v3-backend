# Devin Rule: DAL Usage — ONE way only

## Trigger
- Applies to ALL database access in this repository.

## The rule

There is exactly ONE public API for database access: **`initDal()`** from
`src/db/dal-gateway.ts` (returns the governed `Dal` from
`@primebrick/dal-pg`; US microservices use their own `db/dal.ts`).

Consumers (services, modules, controllers-via-services) MUST:
- import `initDal` from `src/db/dal-gateway.ts` (BE) / `getDal` (US);
- use `Dal` methods — `findAll`, `find`, `findByPage`, `add`, `update`,
  `delete`, `restore`, `hardDelete`, `*Many`, `vectorSearch`,
  `truncate(entity)`, `count`;
- use `dal.entityService(cfg)` for the generic CRUD worker and
  `dal.tableAuditPort()` for the standard audit adapter — there is NO
  `dal.repository()`: the Repository never leaves the gateway;
- multi-statement atomic work goes through `dal.transaction(txRepo => …)` —
  the callback receives a tx-scoped `Repository`, NEVER a raw client;
- connectivity/version probe is `dal.serverVersion()` (a successful call IS
  the health probe — there is no `ping()`);
- receive `Dal`/`Repository` (tx-scoped inside `transaction`) via parameters
  or the singleton — never construct their own connection.

Consumers MUST NOT — NO EXCEPTIONS, EVER:
- import `pg`, `pg.Pool`, `PoolClient` directly outside `src/db/`;
- call `getPool()` / `.query(` / `client.query` anywhere in application code
  — raw SQL is banned outright; there is no "legitimate infra SQL"
  (`SELECT 1`/`version()`/`TRUNCATE`/`BEGIN` are all covered by dedicated
  `Dal`/`Repository` methods). Sole exemption: `run-be-migrations.ts` /
  `db-migration.service.ts` (patch tooling, governed by the migration plan);
- call `dal.withClient` — it is `private` to dal-pg internals;
- create `new Pool()`, `new Client()`, `new Repository(...)`, or raw
  `pool.query` calls;
- bypass dal-pg's `Repository` for entity reads/writes;
- write `upsert`/`INSERT … ON CONFLICT` — removed by design; the standard is
  read (`uuid`+`version`) then `add`/`update` (optimistic lock enforced).

## Library authoring (enforced by visibility)

- `src/db/dal-gateway.ts` `initDal()` is the ONLY DB entry point. Its
  `repoDecorator` (`withCache` over the lazy `CachePort`) already gives every
  `@Cached` entity Redis caching — never build your own repository to get
  caching. `getPool()` is exposed solely for migration/patch tooling
  (`run-be-migrations.ts`, `db-migration.service.ts`); application code
  importing it is a violation. There is no `src/db/pool.ts` anymore.
- Module DALs (`*_dal.ts`, `*-repo.ts`) are parameterless — they call
  `initDal()` internally and keep domain-named methods + business rules.
  They are imported ONLY by services in the same domain.
- TS visibility: infra internals stay `private`/module-local; consumers get
  only `getDal`. New helpers that would leak `pg` types must NOT be exported
  from public barrels.

## Standards gate (CI-enforced)

`pnpm check:standards` runs `primebrick-v3-sdk/tools/check-standards.ts`
(wired into `prebuild` + `test`). It fails the build on any of the bans
above in `src/**` — plus `JSON.stringify`/`JSON.parse` (use
`extJsonStringify`/`extJsonParse`; BE↔US/FE wire is ext-json, bigint-safe).
Legitimate low-level sites (migration `getPool` seam, external wire formats
like OAuth/JWT/RFC7807/Casdoor responses) MUST carry an explicit exemption:

```ts
// standards-exempt: <rule-id> — <why this is the sanctioned place>
```

on the same or previous line (`standards-exempt-file:` for tooling files).
A missing/short reason is itself a violation — every exemption is
review-visible in git diff.
- Lint/CI check: `pg` imports outside `src/db/` should fail review.

## Audit on custom write paths (enforced)

`audit` on a write call is **opt-in and silently skipped** when absent — a
`repo.add/update/delete/restore` without `audit:` writes NO `{table}_audit`
row and fails no check. Module DALs for audited entities (`config_entries`,
`role_mappings`, `user_profiles`, `customers`, `organizations`, …) MUST pass
`audit:` on every single-row write:

- non-tx site: `audit: this.auditPort` (the repo-root adapter);
- tx-capable site (`const repo = tx ?? this.repo`): `audit: new
  BeAuditPortAdapter(repo)` — the adapter MUST be bound to the effective
  writer, never to the root repo. Binding it to `this.repo` while writing on
  `tx` leaks the audit row OUTSIDE the transaction (phantom audit on
  rollback).

Bulk ops (`updateMany`/`deleteMany`) currently emit no per-row audit rows —
do not fake them with `audit:` (the option is ignored); if a bulk path needs
audit, extend the library first.

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


## Deep dive

The normative rules live here; the full mechanics and rationale are in `DAL dev-guide repository-pattern` — link, do not duplicate.
