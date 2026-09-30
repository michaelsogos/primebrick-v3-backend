# Devin Rule: Entity Router Factory (`makeEntityRouter`)

## Trigger

- Applies whenever an AI agent creates or modifies routes under
  `/api/v1/entities/:entity/*`, or adds a new database-backed entity.

## Mandatory

**All entity CRUD route tables MUST be built with `makeEntityRouter`**
(`src/http/entity-router.ts`). Hand-written per-action Express route
registrations for entity CRUD are forbidden — the factory exists so that the
mandatory middleware chain cannot be forgotten or bypassed.

RPC/workflow endpoints (`/api/v1/auth/*`, `/api/v1/system/*`) do NOT use the
factory — they are orchestration, not CRUD.

## What the factory guarantees (non-overridable)

Every standard action registers a route with this chain, always in this
order:

1. `rbacHandler(permissions.<action>)` — explicit permission, always.
2. `validateUuidParam` on every `/:uuid` route.
3. `validateBody`/`validateQuery` from `schemas.*` where applicable.
4. `assertTranslationsPermission` on create/update bodies with `translations`.
5. `requireVersionQuery` on update/delete/purge/restore (caller-observed
   `?version=` — optimistic concurrency, `400 VERSION_REQUIRED` when missing,
   `409`-class concurrency error when stale).
6. `runEntityWrite` on create/update — transaction + translations + optional
   `hooks.afterWrite`.

`handlers.<action>` overrides ONLY the handler body — never the chain.

## Standard route table

| Action | Method + path | Capability gate |
|---|---|---|
| `meta` | `GET /meta` | `permissions.meta` |
| `list` | `GET /list` | `permissions.list` + `schemas.listQuery` |
| `export` | `GET /export` (streaming) | `permissions.export` + `export` config |
| `create` | `POST /` | `permissions.create` + `schemas.createBody` |
| `duplicate` | `POST /duplicate` | **ON BY DEFAULT** — `duplicate: false` opts out |
| `bulkDelete` | `POST /bulk-delete` | `permissions.bulkDelete` |
| `bulkRestore` | `POST /bulk-restore` | `permissions.bulkRestore` |
| `get` | `GET /:uuid` | `permissions.get` |
| `update` | `PUT /:uuid` | `permissions.update` + `schemas.updateBody` |
| `delete` | `DELETE /:uuid` — **soft** | `permissions.delete` |
| `purge` | `DELETE /:uuid/purge` — **hard** | `permissions.purge` |
| `restore` | `POST /:uuid/restore` | `permissions.restore` |
| `audit` | `GET /:uuid/audit` | `permissions.audit` + `schemas.auditQuery` |

**Declaring a permission declares the route.** Omit the permission → the
route is never registered → `404`. `meta.actions` is derived by scanning the
registered routes, so the FE automatically sees `delete.single` /
`purge.single` / `restore.single` etc. with correct `enabled` flags.

### Soft vs hard delete semantics

- `permissions.delete` → soft delete (`deleted_at` stamp) on `DELETE /:uuid`.
- `permissions.purge` → hard delete (physical row removal) on
  `DELETE /:uuid/purge`.
- Hard-delete-only entity (e.g. `role_mapping`): declare `purge` WITHOUT
  `delete` — the soft route 404s by absence.
- Entity supporting both: declare both.
- `restore`/`bulkRestore` only make sense with soft delete — do not declare
  them for hard-delete-only entities.
- Both delete routes take the caller-observed `?version=` guard.

### `duplicate` — ON by default (E.8)

Unlike every other action, `duplicate` registers **without** an explicit
permission: when `permissions.duplicate` is absent the factory derives the
conventional `<entityName>.duplicate.bulk` permission string and applies a
default `{uuids: uuid[].min(1).max(100)}` body schema. Opt out per entity
with `duplicate: false` — required for IdP-synced entities (`organization`,
`role_mapping`, `user_profile`) and domain entities where cloning is
meaningless (`ai_model`, `ai_cerebellum`).

Clone semantics (DAL `repo.clone`): new `uuid`, `@Unique`/`@Key`/audit/
deletable columns reset, all other fields copied verbatim, `@CloneField`
column = source uuid. **Every clone writes an audit row with action
`CLONE`** (not `INSERT`) — the FE version history renders it with its own
label/color. Input is `uuid[]` only — composite-identity lookup is
deliberately unsupported until a clonable entity needs it.

### `export` — meta-derived pipeline (E.7)

Set `export: {}` (or `EntityExportConfig` overrides) on the router config and
the default handler runs `streamEntityExport` (`src/http/entity-export.ts`):
headers/filename are router-owned, the `ExportConfig` is DERIVED from
`meta.columns` (fieldMapping identity map, `col_*` labels resolved via the
translations service, field types from the column `type` —
`datetime`+`datetime_iana_toggle` → `date`+`timezoneField`), and rows come
from `service.stream(query)` — the SAME filter builder as `list`. Templates
resolve by convention at `templates/<entity>_export_template.{xlsx,html}`.
Without `export` config the handler calls `service.export(query, res)`
(legacy contract). The service NEVER touches `res` itself.

## Write response standard

Every entity write returns the **entity from PostgreSQL `RETURNING`** —
never `{success: true}` wrappers, never rebuilt DTOs. `create` → `201`,
other writes → `200`. The FE consumes the entity directly (or just checks
`res.ok`); parent-tab refresh is BroadcastChannel-based and independent of
the response body.

## Service layer — `makeEntityService` (MANDATORY for standard entities)

The service counterpart of the router factory is `makeEntityService`
(`src/http/entity-service.ts`). It owns the ONE copy of the CRUD recipe —
`toDto` date→ISO conversion, `getByUuid` + auditable joins, list
search/sort/filters, `randomUUID` + `repo.add`, update/delete/restore/
purge with caller-observed `version`, `duplicate`, `bulk*`, `audit`,
`stream` — all driven by entity class metadata. **Per-entity DALs are
forbidden** for standard entities: the variation lives in the config.

```ts
const svc = makeEntityService<CustomerDetailDto>({
  entity: CustomerEntity,
  list: {
    searchableKeys: CUSTOMER_SEARCHABLE_KEYS,
    filterableKeys: new Set(CUSTOMER_FILTERABLE_KEYS),
    defaultSort: CUSTOMER_DEFAULT_SORT,
    extraFilters: (q) => q.status ? [statusFilter(q.status)] : [],
    aggregates: [{                            // E.3a — LEFT JOIN + GROUP BY
      name: "user_count",                     // (organizations example)
      expr: "COUNT(u.id)",
      cast: "int",                            // bigint → number on the wire
      join: { entity: UserProfileEntity, alias: "u",
              base: "idp_code", joined: "idp_org",
              extra: "u.deleted_at IS NULL AND u.is_active = true" },
    }],
  },
  hooks: {
    beforeCreate: (body) => transformedBody,        // validation/derivation
    beforeUpdate: (uuid, body) => transformedBody,  // (e.g. ai_model power_level)
    afterWrite: (op, entity) => invalidateCache(),  // post-write side effects
  },
});
```

Structural guarantees: every write goes through `returning:` — a service
CANNOT return `{uuid}`/`{success:true}`; `EntityService<TEntity>` is the
contract `makeEntityRouter<TEntity>` type-checks against. Domain behavior
that doesn't fit hooks/config (Casdoor sync, check-availability) stays in
a thin facade service that delegates DB work to `svc.*` (see
`organizations.service.ts`).

`aggregates` drives the DAL `groupBy`/`having` feature: one query
(`LEFT JOIN ... GROUP BY t.pk`), pagination totals count groups. Use it
for any list rollup — never N+1 per-row count queries.

Notes on the read path:

- `audit()` returns the canonical row shape including `changed_by_name`
  (the FE contract); entities needing field-level enrichment (org's
  `idp_org` → org display_name) post-process the rows in their facade.
- The audit "deleter" join is emitted only when the entity declares
  `deleted_by` — hard-delete-only entities (role_mapping) skip it
  automatically.
- Entities without a `deleted_at` column are fully supported: no
  `deleted_at IS NULL` predicate is emitted.

## Config reference

```ts
makeEntityRouter({
  entityName: 'customer',              // URL segment — snake_case SINGULAR
  entity: CustomerEntity,              // entity class (meta assembly)
  meta: customerMeta,                  // static EntityMeta object
  metaExtraScans?: ExtraActionScan[],  // routers with entity ops outside
                                       // the canonical prefix (e.g.
                                       // /api/v1/auth/users lifecycle for
                                       // user_profile)
  service,                             // service instance
  permissions: { ... },                // Partial<Record<EntityAction, Permission[]>>
                                       // — presence registers the route
  schemas: {                           // zod schemas → validateBody/Query
    listQuery, createBody, updateBody, auditQuery, exportQuery, duplicateBody
  },
  methods: {                           // service method name overrides
    list: 'listCustomers',             // (default: same as action name)
    get: 'getCustomerByUuid',
  },
  hooks: {
    afterWrite: () => service.invalidateCache(),  // runs inside runEntityWrite
    actionMiddlewares: {                          // extra middlewares per action
      delete: [requireMfaStepUp('delete', 'customer')],  // MFA on delete —
      purge:  [requireMfaStepUp('delete', 'customer')],  // system entities only
    },
  },
  duplicate: false,                    // E.8 — opt OUT of the default-on
                                       // duplicate route (IdP-synced or
                                       // domain-lifecycle entities)
  export: {},                          // E.7 — meta-derived export pipeline
                                       // ({columns?, templates?,
                                       //   entityLabels?, translationModule?})
  handlers: {                          // override handler BODIES only
    create: customCreateHandler,       // mandatory chain still applies
    purge: customPurgeHandler,         // (e.g. role_mapping: actor + Casdoor)
  },
  extraRoutes: [ ... ],                // literal-path extras (check-availability)
                                       // registered BEFORE /:uuid routes
});
```

## Examples

### Canonical entity (ai_model)

```ts
export function aiModelsRouter() {
  const service = new AiModelsService();
  return makeEntityRouter({
    entityName: 'ai_model',
    entity: AiModelEntity,
    meta: aiModelMeta,
    service,
    permissions: {
      meta: [Permission.AI_MODEL_READ_ALL, Permission.AI_MODEL_READ_SINGLE],
      list: [Permission.AI_MODEL_READ_ALL],
      get: [Permission.AI_MODEL_READ_SINGLE],
      create: [Permission.AI_MODEL_CREATE_SINGLE],
      update: [Permission.AI_MODEL_UPDATE_SINGLE],
      delete: [Permission.AI_MODEL_DELETE_SINGLE],
      restore: [Permission.AI_MODEL_RESTORE_SINGLE],
      audit: [Permission.AI_MODEL_READ_AUDIT],
    },
    schemas: { listQuery, createBody, updateBody, auditQuery },
    methods: { list: 'listAiModels', /* ... */ },
    hooks: {
      afterWrite: () => service.invalidateCache(),
      actionMiddlewares: { delete: [requireMfaStepUp('delete', 'ai_model')] },
    },
  });
}
```

### Hard-delete-only entity (role_mapping)

```ts
const purge: RequestHandler = asyncHandler(async (req, res) => {
  const version = requireVersionQuery(req);          // same contract as soft
  const deleted = await service.deleteRoleByUuid(    // service owns the
    req.params.uuid, actor(req), version,            // Casdoor sync — NOT the
  );                                                 // controller
  res.json(deleted);
});

return makeEntityRouter({
  entityName: 'role_mapping',
  // ...
  permissions: {
    // ...read/create/update/audit perms...
    purge: [Permission.ROLE_MAPPING_DELETE_SINGLE],  // NO `delete` → soft
  },                                                 // route never exists
  handlers: { create, update, purge },               // bodies overridden,
  hooks: { actionMiddlewares: { purge: [requireMfaStepUp('delete', 'role_mapping')] } },
});
```

### Partial entity (user_profile — writes live in RPC)

```ts
// Only meta/list/get/audit declared. The write lifecycle is RPC under
// /api/v1/auth/users — exposed to the FE via metaExtraScans so
// meta.actions still advertises the external ops.
return makeEntityRouter({
  entityName: 'user_profile',
  // ...
  permissions: { meta: [...], list: [...], get: [...], audit: [...] },
  metaExtraScans: [{ router: authUsersRouter(), prefix: '/api/v1/auth/users' }],
});
```

## Forbidden

- ❌ Registering entity CRUD routes outside `makeEntityRouter` (the chain is
  the guarantee).
- ❌ `DELETE /:uuid` routes without `requireVersionQuery` (or bypassing the
  caller-observed version by re-reading it in the handler — the guard must
  be the version the CALLER saw).
- ❌ `{ success: true }` write responses.
- ❌ Domain workflow endpoints (Casdoor orchestration, invitations) inside
  entity CRUD handlers — put them in RPC routers or the service layer.
- ❌ JSON-stringified `filters=` params — list filters are QS bracket
  notation only (`filters[0][field]=...`).
- ❌ CamelCase or plural `entityName` — snake_case singular, always.

## Frontend contract (automatic)

`EntityListTable` reads `meta.actions`: `delete.single` enabled ⇒
`DELETE /:uuid?version=`; `purge.single` enabled (with `delete.single`
disabled) ⇒ `DELETE /:uuid/purge?version=`; `restore.single` ⇒ restore CTA.
No per-page wiring — a new entity gets correct CTAs and endpoints for free.
