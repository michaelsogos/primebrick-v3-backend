/**
 * entity-router — canonical CRUD router factory for `/api/v1/entities/{name}`.
 *
 * Emits the standard route table via `registerRoutes` on a protected router:
 * every route carries an explicit `rbacHandler` permission and the mandatory
 * middleware chain (uuid/body/query validation, translations permission,
 * version query, `runEntityWrite` transaction wrapper). Those guarantees are
 * NOT overridable — `handlers.<action>` replaces ONLY the handler body (the
 * "between try and catch"), never the chain around it.
 *
 * Standard actions and their defaults:
 *   meta         GET  /meta                          -> assembleMeta + derived actions
 *   list         GET  /list      [validateQuery]     -> service.list(req.query)
 *   export       GET  /export    [validateQuery]     -> service.export(req.query, res)  (streaming)
 *   create       POST /          [validateBody]      -> runEntityWrite -> service.create(entity, tx) -> 201 entity
 *   duplicate    POST /duplicate [validateBody]      -> service.duplicate(body.uuids)
 *   bulkDelete   POST /bulk-delete   [validateBody]  -> service.bulkDelete(body.items)
 *   bulkRestore  POST /bulk-restore  [validateBody]  -> service.bulkRestore(body.items)
 *   get          GET  /:uuid     [uuid]              -> service.get(uuid)
 *   update       PUT  /:uuid     [uuid, validateBody]-> runEntityWrite -> service.update(uuid, entity, tx)
 *   delete       DEL  /:uuid     [uuid]              -> service.delete(uuid, requireVersionQuery)  (soft)
 *   purge        DEL  /:uuid/purge [uuid]            -> service.purge(uuid, requireVersionQuery)   (hard, opt-in)
 *   restore      POST /:uuid/restore [uuid]          -> service.restore(uuid, requireVersionQuery)
 *   audit        GET  /:uuid/audit [uuid, validateQuery] -> service.audit(uuid, page, limit)
 *
 * An action is registered iff `permissions.<action>` is present — declaring
 * the permission declares the route. Non-CRUD / RPC endpoints (e.g.
 * `/api/v1/auth/users` lifecycle) do NOT belong here; use `extraRoutes` for
 * standard-path extras (check-availability) — they register before `:uuid`.
 *
 * Delete semantics are capability-driven, same model:
 *   - `permissions.delete` → soft delete on `DELETE /:uuid`
 *   - `permissions.purge`  → hard delete on `DELETE /:uuid/purge`
 * Declare `purge` WITHOUT `delete` for hard-delete-only entities
 * (e.g. role_mapping): `DELETE /:uuid` is simply never registered → 404.
 * Declare both when the entity supports soft delete AND explicit permanent
 * removal. Both take the caller-observed `?version=` concurrency guard.
 * The FE derives the CTA/endpoint automatically from `meta.actions`
 * (`delete.single` vs `purge.single`) — nothing per page.
 */

import type { IRouter, RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "./protected-router.js";
import { registerRoutes, type RouteDef } from "./define-route.js";
import { asyncHandler } from "./async-handler.js";
import { validateBody, validateQuery } from "./validation.js";
import { ValidationError } from "./api-errors.js";
import { rbacHandler } from "../modules/auth/rbac.middleware.js";
import type { Permission } from "@primebrick/sdk";
import type { EntityMeta } from "./entity-meta.types.js";
import { assembleMeta } from "./meta-assembler.js";
import { deriveEntityActions, type ExtraActionScan } from "./entity-actions.js";
import {
  assertTranslationsPermission,
  runEntityWrite,
  requireVersionQuery,
  type PendingTranslation,
} from "./entity-write.js";
import type { EntityService } from "./entity-service.js";
import { getPool } from "../db/pool.js";

export type EntityAction =
  | "meta"
  | "list"
  | "export"
  | "create"
  | "duplicate"
  | "bulkDelete"
  | "bulkRestore"
  | "get"
  | "update"
  | "delete"
  | "purge"
  | "restore"
  | "audit";

const UuidParamSchema = z.object({ uuid: z.string().uuid() });

export const validateUuidParam: RequestHandler = (req, _res, next) => {
  const r = UuidParamSchema.safeParse(req.params);
  if (!r.success) {
    throw new ValidationError("Request validation failed", { internal_code: "VALIDATION_ERROR" });
  }
  req.params = r.data;
  next();
};

const BulkItemsSchema = z.object({
  items: z
    .array(z.object({ uuid: z.string().uuid(), version: z.number().int() }))
    .min(1)
    .max(100),
});

/**
 * Compile-time CRUD contract (Part E): `service` is `S & Partial<EntityService
 * <TEntity>>` — any method that overlaps a canonical action name (`create`,
 * `update`, `delete`, `restore`, `purge`, `list`, `get`, …) MUST satisfy the
 * `EntityService` signature, i.e. write ops return the entity produced by the
 * DAL `RETURNING` clause. Returning `{ uuid }` or `{ success: true }` under a
 * canonical name is a compile error, not a convention violation.
 * Custom-named methods (e.g. role_mapping's `deleteRoleByUuid`) stay free via
 * `methods` remapping, but their handler is still expected to `res.json` the
 * entity.
 */
export interface EntityRouterConfig<TEntity = unknown, S extends object = object> {
  /** Entity URL segment, e.g. "customer" -> /api/v1/entities/customer/* */
  entityName: string;
  /** Entity class (for meta assembly: auditable/collaboration flags). */
  entity: new () => unknown;
  /** Static entity meta object (e.g. customerMeta). */
  meta: EntityMeta;
  /** Extra routers scanned for entity ops outside the canonical prefix. */
  metaExtraScans?: ExtraActionScan[];

  service: S & Partial<EntityService<TEntity>>;

  /** Permission per action — presence registers the route. */
  permissions: Partial<Record<EntityAction, Permission[]>>;

  /** Schemas driving the mandatory validation middlewares. */
  schemas: {
    listQuery?: z.ZodTypeAny;
    createBody?: z.ZodTypeAny;
    updateBody?: z.ZodTypeAny;
    auditQuery?: z.ZodTypeAny;
    exportQuery?: z.ZodTypeAny;
    duplicateBody?: z.ZodTypeAny;
  };

  /** Service method names per action (defaults: same as action name). Must be keys of `S`. */
  methods?: Partial<Record<EntityAction, keyof S & string>>;

  hooks?: {
    /** Post-write cache invalidation / side effects (inside runEntityWrite). */
    afterWrite?: () => void | Promise<void>;
    /** Extra middlewares per action (e.g. MFA step-up on delete). */
    actionMiddlewares?: Partial<Record<EntityAction, RequestHandler[]>>;
  };

  /** Override an action's handler body; the mandatory chain still applies. */
  handlers?: Partial<Record<EntityAction, RequestHandler>>;

  /** Additional routes registered AFTER literal routes, BEFORE :uuid routes. */
  extraRoutes?: RouteDef[];
}

export function makeEntityRouter<TEntity, S extends object>(
  config: EntityRouterConfig<TEntity, S>,
): IRouter {
  const router = makeProtectedRouter();
  const service = config.service;
  const base = `/api/v1/entities/${config.entityName}`;
  const method = (a: EntityAction) => (config.methods?.[a] ?? a) as keyof S & string;
  const call = (a: EntityAction, ...args: unknown[]) =>
    (service as Record<string, (...x: unknown[]) => Promise<unknown>>)[method(a)](...args);

  const afterWrite = config.hooks?.afterWrite
    ? async () => { await config.hooks!.afterWrite!(); }
    : undefined;
  const extraMw = (a: EntityAction) => config.hooks?.actionMiddlewares?.[a] ?? [];

  const defaults: Record<EntityAction, RequestHandler> = {
    meta: (_req, res) => {
      res.json({
        ...assembleMeta(config.meta, config.entity),
        actions: deriveEntityActions(router, config.entityName, config.meta.actions_overrides, config.metaExtraScans),
      });
    },
    list: asyncHandler(async (req, res) => {
      res.json(await call("list", req.query));
    }),
    export: asyncHandler(async (req, res) => {
      await call("export", req.query, res);
    }),
    create: asyncHandler(async (req, res) => {
      const body = req.body as { entity: unknown; translations?: PendingTranslation[] };
      assertTranslationsPermission(req, body.translations);
      const created = await runEntityWrite(
        getPool(),
        body.translations,
        (tx) => call("create", body.entity, tx),
        afterWrite,
      );
      res.status(201).json(created);
    }),
    duplicate: asyncHandler(async (req, res) => {
      const body = req.body as { uuids: string[] };
      res.json(await call("duplicate", body.uuids));
    }),
    bulkDelete: asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof BulkItemsSchema>;
      res.json(await call("bulkDelete", body.items));
    }),
    bulkRestore: asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof BulkItemsSchema>;
      res.json(await call("bulkRestore", body.items));
    }),
    get: asyncHandler(async (req, res) => {
      res.json(await call("get", req.params.uuid));
    }),
    update: asyncHandler(async (req, res) => {
      const body = req.body as { entity: unknown; translations?: PendingTranslation[] };
      assertTranslationsPermission(req, body.translations);
      const updated = await runEntityWrite(
        getPool(),
        body.translations,
        (tx) => call("update", req.params.uuid, body.entity, tx),
        afterWrite,
      );
      res.json(updated);
    }),
    delete: asyncHandler(async (req, res) => {
      res.json(await call("delete", req.params.uuid, requireVersionQuery(req)));
    }),
    purge: asyncHandler(async (req, res) => {
      res.json(await call("purge", req.params.uuid, requireVersionQuery(req)));
    }),
    restore: asyncHandler(async (req, res) => {
      res.json(await call("restore", req.params.uuid, requireVersionQuery(req)));
    }),
    audit: asyncHandler(async (req, res) => {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      res.json(await call("audit", req.params.uuid, page, limit));
    }),
  };

  const handler = (a: EntityAction) => config.handlers?.[a] ?? defaults[a];
  const perms = (a: EntityAction) => {
    const p = config.permissions[a];
    return p ? rbacHandler(p) : undefined;
  };

  const literalDefs: RouteDef[] = [];
  const paramDefs: RouteDef[] = [];
  const push = (defs: RouteDef[], action: EntityAction, def: Omit<RouteDef, "permission" | "handler">) => {
    const permission = perms(action);
    if (!permission) return;
    defs.push({ permission, handler: handler(action), ...def });
  };

  push(literalDefs, "meta", { method: "get", path: `${base}/meta` });
  push(literalDefs, "list", {
    method: "get",
    path: `${base}/list`,
    middlewares: [...(config.schemas.listQuery ? [validateQuery(config.schemas.listQuery)] : []), ...extraMw("list")],
  });
  push(literalDefs, "export", {
    method: "get",
    path: `${base}/export`,
    middlewares: [...(config.schemas.exportQuery ? [validateQuery(config.schemas.exportQuery)] : []), ...extraMw("export")],
  });
  push(literalDefs, "create", {
    method: "post",
    path: base,
    middlewares: [...(config.schemas.createBody ? [validateBody(config.schemas.createBody)] : []), ...extraMw("create")],
  });
  push(literalDefs, "duplicate", {
    method: "post",
    path: `${base}/duplicate`,
    middlewares: [...(config.schemas.duplicateBody ? [validateBody(config.schemas.duplicateBody)] : []), ...extraMw("duplicate")],
  });
  push(literalDefs, "bulkDelete", {
    method: "post",
    path: `${base}/bulk-delete`,
    middlewares: [validateBody(BulkItemsSchema), ...extraMw("bulkDelete")],
  });
  push(literalDefs, "bulkRestore", {
    method: "post",
    path: `${base}/bulk-restore`,
    middlewares: [validateBody(BulkItemsSchema), ...extraMw("bulkRestore")],
  });

  push(paramDefs, "get", { method: "get", path: `${base}/:uuid`, middlewares: [validateUuidParam, ...extraMw("get")] });
  push(paramDefs, "update", {
    method: "put",
    path: `${base}/:uuid`,
    middlewares: [validateUuidParam, ...(config.schemas.updateBody ? [validateBody(config.schemas.updateBody)] : []), ...extraMw("update")],
  });
  push(paramDefs, "purge", {
    method: "delete",
    path: `${base}/:uuid/purge`,
    middlewares: [validateUuidParam, ...extraMw("purge")],
  });
  push(paramDefs, "delete", {
    method: "delete",
    path: `${base}/:uuid`,
    middlewares: [validateUuidParam, ...extraMw("delete")],
  });
  push(paramDefs, "restore", {
    method: "post",
    path: `${base}/:uuid/restore`,
    middlewares: [validateUuidParam, ...extraMw("restore")],
  });
  push(paramDefs, "audit", {
    method: "get",
    path: `${base}/:uuid/audit`,
    middlewares: [validateUuidParam, ...(config.schemas.auditQuery ? [validateQuery(config.schemas.auditQuery)] : []), ...extraMw("audit")],
  });

  registerRoutes(router, [...literalDefs, ...(config.extraRoutes ?? []), ...paramDefs]);
  return router;
}
