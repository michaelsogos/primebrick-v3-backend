/**
 * ai-models.router — thin controller for the `ai_model` entity.
 *
 * Endpoints:
 *   GET    /api/v1/entities/ai_model/meta            → entity metadata
 *   GET    /api/v1/entities/ai_model/list            → paginated list
 *   GET    /api/v1/entities/ai_model/:uuid            → single record
 *   POST   /api/v1/entities/ai_model                  → create
 *   PUT    /api/v1/entities/ai_model/:uuid            → update
 *   DELETE /api/v1/entities/ai_model/:uuid            → soft delete
 *   POST   /api/v1/entities/ai_model/:uuid/restore   → restore soft-deleted
 *   GET    /api/v1/entities/ai_model/:uuid/audit      → audit history
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
import { isDatabaseUnavailableError } from "../../http/api-errors.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import {
  AiModelListQuerySchema,
  AiModelCreateBodySchema,
  AiModelUpdateBodySchema,
  AiModelAuditQuerySchema,
  UuidParamSchema,
} from "./dto.js";
import { aiModelMeta } from "./ai_models.meta.js";
import { AiModelEntity } from "./ai_model_entity.js";
import { AiModelsService } from "./ai_models.service.js";
import { ValidationError } from "../../http/api-errors.js";
import {
  entityWriteBody,
  assertTranslationsPermission,
  runEntityWrite,
} from "../../http/entity-write.js";
import { getPool } from "../../db/pool.js";
import { AiModelsDal } from "./ai_models_dal.js";
import { assembleMeta } from "../../http/meta-assembler.js";
import { deriveEntityActions } from "../../http/entity-actions.js";
import { requireMfaStepUp } from "../auth/mfa-step-up.middleware.js";

// Write-payload standard: `{entity, translations?}` (src/http/entity-write.ts)
const AiModelCreateWriteSchema = entityWriteBody(AiModelCreateBodySchema);
const AiModelUpdateWriteSchema = entityWriteBody(AiModelUpdateBodySchema);

/** Inline UUID param validation middleware (preserves the original behavior). */
function validateUuidParam(req: any, _res: any, next: any): void {
  const r = UuidParamSchema.safeParse(req.params);
  if (!r.success) {
    throw new ValidationError("Request validation failed", { internal_code: "VALIDATION_ERROR" });
  }
  req.params = r.data;
  next();
}

export function aiModelsRouter() {
  const router = makeProtectedRouter();
  const service = new AiModelsService();

  const getMeta: RequestHandler = (_req, res) => {
    res.json({
      ...assembleMeta(aiModelMeta, AiModelEntity),
      actions: deriveEntityActions(router, "ai_model", aiModelMeta.list.actions_overrides),
    });
  };

  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = req.query as unknown as import("./dto.js").AiModelListQuery;
    try {
      const result = await service.listAiModels(query);
      res.json(result);
    } catch (e) {
      if (isDatabaseUnavailableError(e)) throw e;
      throw e;
    }
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof AiModelCreateWriteSchema>;
    assertTranslationsPermission(req, body.translations);
    const dal = new AiModelsDal(getPool());
    const created = await runEntityWrite(
      getPool(),
      body.translations,
      (tx) => service.createAiModel(body.entity, tx),
      () => dal.invalidateCache(),
    );
    res.status(201).json(created);
  });

  const getSingle: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const found = await service.getAiModel(uuid);
    res.json(found);
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const body = req.body as z.infer<typeof AiModelUpdateWriteSchema>;
    assertTranslationsPermission(req, body.translations);
    const dal = new AiModelsDal(getPool());
    await runEntityWrite(
      getPool(),
      body.translations,
      (tx) => service.updateAiModel(uuid, body.entity, tx),
      () => dal.invalidateCache(),
    );
    res.status(204).send();
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    await service.deleteAiModel(uuid);
    res.status(204).send();
  });

  const restore: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    await service.restoreAiModel(uuid);
    res.status(204).send();
  });

  const getAudit: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const { page, limit } = req.query as unknown as import("./dto.js").AiModelAuditQuery;
    const result = await service.getAiModelAudit(uuid, page, limit);
    res.json(result);
  });

  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/entities/ai_model/meta",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/ai_model/list",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateQuery(AiModelListQuerySchema)],
      handler: list,
    },
    {
      method: "get",
      path: "/api/v1/entities/ai_model/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateUuidParam],
      handler: getSingle,
    },
    {
      method: "post",
      path: "/api/v1/entities/ai_model",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(AiModelCreateWriteSchema)],
      handler: create,
    },
    {
      method: "put",
      path: "/api/v1/entities/ai_model/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateUuidParam, validateBody(AiModelUpdateWriteSchema)],
      handler: update,
    },
    {
      method: "delete",
      path: "/api/v1/entities/ai_model/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateUuidParam, requireMfaStepUp("delete", "ai_model")],
      handler: remove,
    },
    {
      method: "post",
      path: "/api/v1/entities/ai_model/:uuid/restore",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateUuidParam],
      handler: restore,
    },
    {
      method: "get",
      path: "/api/v1/entities/ai_model/:uuid/audit",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateUuidParam, validateQuery(AiModelAuditQuerySchema)],
      handler: getAudit,
    },
  ]);

  return router;
}
