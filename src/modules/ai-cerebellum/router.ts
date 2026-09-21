/**
 * ai-cerebellum.router — thin controller for the `ai_cerebellum` entity.
 *
 * Endpoints mirror the ai_model router:
 *   GET    /api/v1/entities/ai_cerebellum/meta
 *   GET    /api/v1/entities/ai_cerebellum/list
 *   GET    /api/v1/entities/ai_cerebellum/:uuid
 *   POST   /api/v1/entities/ai_cerebellum
 *   PUT    /api/v1/entities/ai_cerebellum/:uuid
 *   DELETE /api/v1/entities/ai_cerebellum/:uuid
 *   POST   /api/v1/entities/ai_cerebellum/:uuid/restore
 *   GET    /api/v1/entities/ai_cerebellum/:uuid/audit
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../http/protected-router.js";
import { registerRoutes } from "../../http/define-route.js";
import { asyncHandler } from "../../http/async-handler.js";
import { validateBody, validateQuery } from "../../http/validation.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import {
  AiCerebellumListQuerySchema,
  AiCerebellumCreateBodySchema,
  AiCerebellumUpdateBodySchema,
  AiCerebellumAuditQuerySchema,
  UuidParamSchema,
} from "./dto.js";
import { aiCerebellumMeta } from "./ai_cerebellum.meta.js";
import { AiCerebellumEntity } from "./ai_cerebellum_entity.js";
import { AiCerebellumService } from "./ai_cerebellum.service.js";
import { ValidationError } from "../../http/api-errors.js";
import {
  entityWriteBody,
  assertTranslationsPermission,
  runEntityWrite,
  requireVersionQuery,
} from "../../http/entity-write.js";
import { getPool } from "../../db/pool.js";
import { AiCerebellumDal } from "./ai_cerebellum_dal.js";
import { assembleMeta } from "../../http/meta-assembler.js";
import { deriveEntityActions } from "../../http/entity-actions.js";
import { requireMfaStepUp } from "../auth/mfa-step-up.middleware.js";

// Write-payload standard: `{entity, translations?}` (src/http/entity-write.ts)
const AiCerebellumCreateWriteSchema = entityWriteBody(AiCerebellumCreateBodySchema);
const AiCerebellumUpdateWriteSchema = entityWriteBody(AiCerebellumUpdateBodySchema);

/** Inline UUID param validation middleware (preserves the original behavior). */
function validateUuidParam(req: any, _res: any, next: any): void {
  const r = UuidParamSchema.safeParse(req.params);
  if (!r.success) {
    throw new ValidationError("Request validation failed", { internal_code: "VALIDATION_ERROR" });
  }
  req.params = r.data;
  next();
}

export function aiCerebellumRouter() {
  const router = makeProtectedRouter();
  const service = new AiCerebellumService();

  const getMeta: RequestHandler = (_req, res) => {
    res.json({
      ...assembleMeta(aiCerebellumMeta, AiCerebellumEntity),
      actions: deriveEntityActions(
        router,
        "ai_cerebellum",
        aiCerebellumMeta.list.actions_overrides,
      ),
    });
  };

  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = req.query as unknown as import("./dto.js").AiCerebellumListQuery;
    const result = await service.listAiCerebellum(query);
    res.json(result);
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof AiCerebellumCreateWriteSchema>;
    assertTranslationsPermission(req, body.translations);
    const dal = new AiCerebellumDal(getPool());
    const created = await runEntityWrite(
      getPool(),
      body.translations,
      (tx) => service.createAiCerebellum(body.entity, tx),
      () => dal.invalidateCache(),
    );
    res.status(201).json(created);
  });

  const getSingle: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const found = await service.getAiCerebellum(uuid);
    res.json(found);
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const body = req.body as z.infer<typeof AiCerebellumUpdateWriteSchema>;
    assertTranslationsPermission(req, body.translations);
    const dal = new AiCerebellumDal(getPool());
    const updated = await runEntityWrite(
      getPool(),
      body.translations,
      (tx) => service.updateAiCerebellum(uuid, body.entity, tx),
      () => dal.invalidateCache(),
    );
    res.status(200).json(updated);
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const version = requireVersionQuery(req);
    res.status(200).json(await service.deleteAiCerebellum(uuid, version));
  });

  const restore: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const version = requireVersionQuery(req);
    res.status(200).json(await service.restoreAiCerebellum(uuid, version));
  });

  const getAudit: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const { page, limit } = req.query as unknown as import("./dto.js").AiCerebellumAuditQuery;
    const result = await service.getAiCerebellumAudit(uuid, page, limit);
    res.json(result);
  });

  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/entities/ai_cerebellum/meta",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/ai_cerebellum/list",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateQuery(AiCerebellumListQuerySchema)],
      handler: list,
    },
    {
      method: "get",
      path: "/api/v1/entities/ai_cerebellum/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateUuidParam],
      handler: getSingle,
    },
    {
      method: "post",
      path: "/api/v1/entities/ai_cerebellum",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(AiCerebellumCreateWriteSchema)],
      handler: create,
    },
    {
      method: "put",
      path: "/api/v1/entities/ai_cerebellum/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateUuidParam, validateBody(AiCerebellumUpdateWriteSchema)],
      handler: update,
    },
    {
      method: "delete",
      path: "/api/v1/entities/ai_cerebellum/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateUuidParam, requireMfaStepUp("delete", "ai_cerebellum")],
      handler: remove,
    },
    {
      method: "post",
      path: "/api/v1/entities/ai_cerebellum/:uuid/restore",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateUuidParam],
      handler: restore,
    },
    {
      method: "get",
      path: "/api/v1/entities/ai_cerebellum/:uuid/audit",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateUuidParam, validateQuery(AiCerebellumAuditQuerySchema)],
      handler: getAudit,
    },
  ]);

  return router;
}
