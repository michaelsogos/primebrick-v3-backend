# Devin Rule: DAL Usage — ONE way only

> Canonical body of `.devin/rules/dal-usage.md` — the rule file is a pointer to this page.

## Trigger
- Applies to ALL database access in this repository.

## The rule

Worker services reach data through **`DomainService<TEntity>`**
(`src/db/domain-service.ts`): `this.dal` (the governed `Dal` proxies —
`findAll`, `find`, `findByPage`, `add`, `update`, `delete`, `restore`,
`hardDelete`, `*Many`, `vectorSearch`, `truncate(entity)`, `count`) and
`this.svc` (the composed generic CRUD service). Domain queries are METHODS
on the owning service — the per-domain `*_dal.ts`/`*-repo.ts` wrapper layer
was removed (2026-10-16, service-layer-oop-consolidation plan).

`getDal()`/`initDal()` are NOT a consumer API: they are reachable only
inside the declared allowlist (`.devin/check-standards.json` →
`rules."dal-access".allowPaths` — gateway, entity-router plumbing,
bootstrap, approved DB-backed SDK ports, plus a shrink-to-zero legacy
list). `initDal()` itself is bootstrap-only (`index.ts`), once, before
migrations; `getDal()` fails fast if called before boot.

Consumers MUST:
- extend `DomainService` and use `this.dal.*` / `this.svc.*`;
- use `dal.entityService(cfg)` for the generic CRUD worker and
  `dal.tableAuditPort()` for the standard audit adapter — there is NO
  `dal.repository()`: the Repository never leaves the gateway;
- multi-statement atomic work goes through `dal.transaction(txRepo => …)` —
  the callback receives a tx-scoped `Repository`, NEVER a raw client;
- connectivity/version probe is `dal.serverVersion()` (a successful call IS
  the health probe — there is no `ping()`);
- receive `Dal`/`Repository` (tx-scoped inside `transaction`) via parameters
  or the base class — never construct their own connection.

Consumers MUST NOT — NO EXCEPTIONS, EVER:
- call `getDal()`/`initDal()` outside the `dal-access` allowlist
  (CI-enforced — see Standards gate below);
- create new `*_dal.ts`/`*-repo.ts` per-domain wrapper files — domain
  queries live as methods on the owning `DomainService` subclass;
- import `pg`, `pg.Pool`, `PoolClient` directly outside `src/db/`;
- call `getPool()` / `.query(` / `client.query` anywhere in application code
  — raw SQL is banned outright; there is no "legitimate infra SQL"
  (`SELECT 1`/`version()`/`TRUNCATE`/`BEGIN` are all covered by dedicated
  `Dal`/`Repository` methods). Sole exemption: `run-module-migrations.ts` /
  `db-migration.service.ts` (patch tooling, governed by the migration plan);
- call `dal.withClient` — it is `private` to dal-pg internals;
- create `new Pool()`, `new Client()`, `new Repository(...)`, or raw
  `pool.query` calls;
- bypass dal-pg's `Repository` for entity reads/writes;
- import `*(-|_)(dal|repo|repository)` modules inside `controllers/` or
  `modules/mcp/` (CI rule `layer-repo-import`) — transport/dispatch layers
  call services, never data wrappers;
- write `upsert`/`INSERT … ON CONFLICT` — removed by design; the standard is
  read (`uuid`+`version`) then `add`/`update` (optimistic lock enforced).

## Library authoring (enforced by visibility)

- `src/db/dal-gateway.ts` owns the entry points: `initDal()` (bootstrap-only,
  `index.ts`) and the re-exported `getDal()` singleton accessor. Its
  `repoDecorator` (`withCache` over the lazy `CachePort`) already gives every
  `@Cached` entity Redis caching — never build your own repository to get
  caching. `getPool()` is exposed solely for migration/patch tooling
  (`run-module-migrations.ts`, `db-migration.service.ts`); application code
  importing it is a violation. There is no `src/db/pool.ts` anymore.
- `src/db/domain-service.ts` `DomainService<TEntity>` is THE worker-service
  base: lazy `this.dal`/`this.svc`, `buildConfig()` injects
  `EntityAuditPort`/`requireActor`/`UserProfileEntity`. Service singletons
  are exposed via `getXxxService()` module-level lazy holders.
- TS visibility: infra internals stay `private`/module-local; new helpers
  that would leak `pg` types must NOT be exported from public barrels.

## Standards gate (CI-enforced)

`pnpm check:standards` runs `primebrick-v3-sdk/tools/check-standards.ts`
(wired into `prebuild` + `test`). It fails the build on any of the bans
above in `src/**` — plus `JSON.stringify`/`JSON.parse` (use
`extJsonStringify`/`extJsonParse`; BE↔US/FE wire is ext-json, bigint-safe),
plus the config-gated rules enabled in `.devin/check-standards.json`:

- `dal-access` — `getDal(`/`initDal(` outside the JSON `allowPaths`
  (the LEGACY entries are tracked debt — shrink to zero, never grow);
- `layer-repo-import` — `*(-|_)(dal|repo|repository)` imports inside
  `controllers/` + `modules/mcp/`.

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
`role_mappings`, `user_profiles`, `api_keys`, `organizations`, …) MUST pass
`audit:` on every single-row write:

- non-tx site: `audit: this.auditPort` (the repo-root adapter);
- tx-capable site (`const repo = tx ?? this.repo`): `audit: new
  EntityAuditPort(repo)` — the adapter MUST be bound to the effective
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
