/**
 * config-entries.router — thin controller for the `config_entries` entity
 * CRUD surface (admin). Exposes the Config Table standard endpoints used by
 * the FE Security page and future Config Table pages.
 *
 * Endpoints:
 *   GET    /api/v1/entities/config_entry/meta              → entity metadata
 *   GET    /api/v1/entities/config_entry/list              → all rows (secrets masked)
 *   GET    /api/v1/entities/config_entry/:uuid             → single row (secret masked)
 *   POST   /api/v1/entities/config_entry                   → create new config row (validates value)
 *   PUT    /api/v1/entities/config_entry/:uuid             → update value (validates type)
 *   PUT    /api/v1/entities/config_entry/bulk-update       → bulk typed-value update
 *   DELETE /api/v1/entities/config_entry/:uuid             → soft-delete (reserved rejected, step-up MFA)
 *   POST   /api/v1/entities/config_entry/bulk-delete       → bulk soft-delete (reserved rejected, step-up MFA)
 *   POST   /api/v1/entities/config_entry/:uuid/restore     → restore soft-deleted row
 *
 * The router contains NO business logic — duplicate-key checks, value
 * serialization/validation, reserved-row error mapping, secret masking and
 * audit paging live in `ConfigEntriesService`. All errors are thrown as
 * `ApiError` subclasses and converted to RFC 7807 by `errorHandler`.
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../../../modules/auth/rbac.middleware.js";
import {
  Permission,
  CACHE_HEADERS,
  CACHE_CONTROL_CACHED,
  etagMatches,
} from "@primebrick/sdk";
import {
  entityWriteBody,
  assertTranslationsPermission,
  runEntityWrite,
} from "../../../http/entity-write.js";
import { getPool } from "../../../db/pool.js";
import { ConfigEntryEntity } from "../../../modules/auth/config_entry_entity.js";
import { configEntriesMeta } from "../../../modules/auth/config-entries.meta.js";
import { ConfigEntriesService } from "../../../modules/auth/services/config-entries.service.js";
import { assembleMeta } from "../../../http/meta-assembler.js";
import { deriveEntityActions } from "../../../http/entity-actions.js";
import { requireMfaStepUp } from "../../../modules/auth/mfa-step-up.middleware.js";
import { ApiError } from "../../../http/api-errors.js";

/** Require an authenticated user and return their UUID (user_profiles.uuid). */
function requireUserUuid(req: import("express").Request): string {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new ApiError(
      "/errors/unauthorized",
      "Unauthorized",
      401,
      "User ID not found in request",
      { internal_code: "USER_NOT_AUTHENTICATED" },
    );
  }
  return userId;
}

const UuidParamSchema = z.object({
  uuid: z.string().min(1),
});

const UpdateBodySchema = z.object({
  value: z.union([z.string(), z.number(), z.bigint()]).optional(),
  type: z.string().min(1).max(50).optional(),
  type_config: z.string().nullable().optional(),
  // Ext-JSON decodes every integer as bigint — accept both.
  version: z.union([z.number().int().min(1), z.bigint()]),
});

const BulkDeleteBodySchema = z.object({
  items: z.array(z.object({
    uuid: z.string().min(1),
    // Caller-observed version — per-row optimistic-concurrency guard.
    version: z.union([z.number().int().min(1), z.bigint()]),
  })).min(1),
});

const BulkUpdateBodySchema = z.object({
  updates: z.array(
    z.object({
      uuid: z.string().min(1),
      value: z.union([z.string(), z.number(), z.bigint()]).optional(),
      type: z.string().min(1).max(50).optional(),
      type_config: z.string().nullable().optional(),
      version: z.union([z.number().int().min(1), z.bigint()]),
    })
  ).min(1),
});

/**
 * Write-payload standard: `{ entity, translations? }` (see
 * `src/http/entity-write.ts`). `entity` carries the row fields;
 * `translations` rows are inserted in the SAME transaction as the entity
 * (atomic: all-or-nothing, statement-level idempotent).
 */
const CreateEntitySchema = z.object({
  key: z.string().min(1).max(100),
  value: z.union([z.string(), z.number(), z.bigint()]),
  type: z.string().min(1).max(50),
  type_config: z.string().nullable().optional(),
  label_key: z.string().max(100).nullable().optional(),
  description_key: z.string().max(100).nullable().optional(),
  group_key: z.string().max(100).nullable().optional(),
  reserved: z.boolean().optional(),
});

const CreateBodySchema = entityWriteBody(CreateEntitySchema);
const UpdateBodySchemaWrapped = entityWriteBody(UpdateBodySchema);

export function configEntriesRouter() {
  const router = makeProtectedRouter();
  const service = new ConfigEntriesService();

  const getMeta: RequestHandler = asyncHandler(async (_req, res) => {
    res.json({
      ...assembleMeta(configEntriesMeta, ConfigEntryEntity),
      actions: deriveEntityActions(
        router,
        "config_entry",
        configEntriesMeta.actions_overrides,
      ),
    });
  });

  const list: RequestHandler = asyncHandler(async (req, res) => {
    const entry = await service.list();
    const ifNoneMatch = req.headers[CACHE_HEADERS.IF_NONE_MATCH.toLowerCase()] as string | undefined;
    if (ifNoneMatch && etagMatches(ifNoneMatch, entry.etag)) {
      res.setHeader(CACHE_HEADERS.ETAG, entry.etag);
      res.setHeader(CACHE_HEADERS.PB_CACHED, "true");
      res.setHeader("Cache-Control", CACHE_CONTROL_CACHED);
      res.status(304).end();
      return;
    }
    res.setHeader(CACHE_HEADERS.ETAG, entry.etag);
    res.setHeader(CACHE_HEADERS.PB_CACHED, "true");
    res.setHeader("Cache-Control", CACHE_CONTROL_CACHED);
    res.json({ rows: entry.data.map((r) => service.maskSecretValue(r)) });
  });

  const getSingle: RequestHandler = asyncHandler(async (req, res) => {
    const row = await service.getByUuid(req.params.uuid as string);
    res.json(service.maskSecretValue(row));
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof CreateBodySchema>;
    const translations = body.translations ?? [];
    const userUuid = requireUserUuid(req);

    assertTranslationsPermission(req, translations);

    const params = await service.prepareCreate(body.entity);
    // Single tx when translations are piggybacked: entity row + translation
    // rows commit atomically (all-or-nothing). Post-commit cache invalidation
    // is handled by runEntityWrite.
    const row = await runEntityWrite(
      getPool(),
      translations,
      (tx) => service.create(params, userUuid, tx),
      () => service.refreshCache(),
    );

    res.status(201).json(service.maskSecretValue(row));
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const uuid = req.params.uuid as string;
    const body = req.body as z.infer<typeof UpdateBodySchemaWrapped>;
    const translations = body.translations ?? [];
    const userUuid = requireUserUuid(req);

    assertTranslationsPermission(req, translations);

    const patch = await service.prepareUpdate(uuid, body.entity);
    await runEntityWrite(
      getPool(),
      translations,
      (tx) =>
        service.update(uuid, { ...patch, version: Number(body.entity.version) }, userUuid, tx),
      () => service.refreshCache(),
    );
    res.json({ success: true });
  });

  const bulkUpdate: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof BulkUpdateBodySchema>;
    const userUuid = requireUserUuid(req);
    const updated = await service.bulkUpdate(body.updates, userUuid);
    res.json({ success: true, updated });
  });

  const getAudit: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const limit = parseInt(String(req.query.limit ?? "50"), 10);
    res.json(await service.getAudit(uuid, page, limit));
  });

  const softDelete: RequestHandler = asyncHandler(async (req, res) => {
    const uuid = req.params.uuid as string;
    // Caller-observed version (ERR02 if absent — enforced by the DAL).
    const version = req.query.version !== undefined ? Number(req.query.version) : (undefined as unknown as number);
    const row = await service.softDelete(uuid, version, requireUserUuid(req));
    res.json(service.maskSecretValue(row));
  });

  const bulkDelete: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof BulkDeleteBodySchema>;
    const result = await service.bulkDelete(body.items, requireUserUuid(req));
    res.status(200).json(result);
  });

  const restore: RequestHandler = asyncHandler(async (req, res) => {
    const uuid = req.params.uuid as string;
    // Caller-observed version (ERR02 if absent — enforced by the DAL).
    const version = req.query.version !== undefined ? Number(req.query.version) : (undefined as unknown as number);
    const row = await service.restore(uuid, version, requireUserUuid(req));
    res.json(service.maskSecretValue(row));
  });

  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/entities/config_entry/meta",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/config_entry/list",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: list,
    },
    {
      method: "get",
      path: "/api/v1/entities/config_entry/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: getSingle,
    },
    {
      method: "post",
      path: "/api/v1/entities/config_entry",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(CreateBodySchema)],
      handler: create,
    },
    {
      method: "put",
      path: "/api/v1/entities/config_entry/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(UpdateBodySchemaWrapped)],
      handler: update,
    },
    {
      method: "put",
      path: "/api/v1/entities/config_entry/bulk-update",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(BulkUpdateBodySchema)],
      handler: bulkUpdate,
    },
    {
      method: "get",
      path: "/api/v1/entities/config_entry/:uuid/audit",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: getAudit,
    },
    {
      method: "delete",
      path: "/api/v1/entities/config_entry/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [requireMfaStepUp("delete", "config_entries")],
      handler: softDelete,
    },
    {
      method: "post",
      path: "/api/v1/entities/config_entry/bulk-delete",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(BulkDeleteBodySchema), requireMfaStepUp("bulk_delete", "config_entries")],
      handler: bulkDelete,
    },
    {
      method: "post",
      path: "/api/v1/entities/config_entry/:uuid/restore",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: restore,
    },
  ]);

  return router;
}
