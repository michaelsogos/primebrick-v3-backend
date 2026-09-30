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
| `export` | `GET /export` (streaming) | `permissions.export` |
| `create` | `POST /` | `permissions.create` + `schemas.createBody` |
| `duplicate` | `POST /duplicate` | `permissions.duplicate` |
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

## Write response standard

Every entity write returns the **entity from PostgreSQL `RETURNING`** —
never `{success: true}` wrappers, never rebuilt DTOs. `create` → `201`,
other writes → `200`. The FE consumes the entity directly (or just checks
`res.ok`); parent-tab refresh is BroadcastChannel-based and independent of
the response body.

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
