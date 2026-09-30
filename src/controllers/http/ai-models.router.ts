/**
 * ai-models.router — thin controller for the `ai_model` entity.
 *
 * Standard entity CRUD via `makeEntityRouter` — mandatory chain (permission,
 * uuid/body/query validation, translations permission, version query,
 * runEntityWrite tx) is non-overridable. Entity-specific deviations would go
 * through `handlers`/`extraRoutes` — none needed here.
 *
 *   GET    /api/v1/entities/ai_model/meta            → entity metadata
 *   GET    /api/v1/entities/ai_model/list            → paginated list
 *   GET    /api/v1/entities/ai_model/:uuid            → single record
 *   POST   /api/v1/entities/ai_model                  → create
 *   PUT    /api/v1/entities/ai_model/:uuid            → update
 *   DELETE /api/v1/entities/ai_model/:uuid            → soft delete (MFA step-up)
 *   POST   /api/v1/entities/ai_model/:uuid/restore   → restore soft-deleted
 *   GET    /api/v1/entities/ai_model/:uuid/audit      → audit history
 */

import { Permission } from "@primebrick/sdk";

import { makeEntityRouter } from "../../http/entity-router.js";
import { entityWriteBody } from "../../http/entity-write.js";
import { requireMfaStepUp } from "../../modules/auth/mfa-step-up.middleware.js";
import {
  AiModelListQuerySchema,
  AiModelCreateBodySchema,
  AiModelUpdateBodySchema,
  AiModelAuditQuerySchema,
} from "../../modules/ai-models/dto.js";
import { aiModelMeta } from "../../modules/ai-models/ai_models.meta.js";
import { AiModelEntity } from "../../modules/ai-models/ai_model_entity.js";
import { AiModelsService } from "../../modules/ai-models/ai_models.service.js";

const AiModelCreateWriteSchema = entityWriteBody(AiModelCreateBodySchema);
const AiModelUpdateWriteSchema = entityWriteBody(AiModelUpdateBodySchema);

export function aiModelsRouter() {
  const service = new AiModelsService();

  return makeEntityRouter({
    entityName: "ai_model",
    entity: AiModelEntity,
    meta: aiModelMeta,
    service,
    permissions: {
      meta: [Permission.AUTHENTICATED_USER],
      list: [Permission.AUTHENTICATED_USER],
      get: [Permission.AUTHENTICATED_USER],
      create: [Permission.AUTHENTICATED_ADMIN],
      update: [Permission.AUTHENTICATED_ADMIN],
      delete: [Permission.AUTHENTICATED_ADMIN],
      restore: [Permission.AUTHENTICATED_ADMIN],
      audit: [Permission.AUTHENTICATED_ADMIN],
    },
    // E.8: duplicate is ON by default — explicitly disabled for this
    // IdP-synced / domain-lifecycle entity (cloning is meaningless).
    duplicate: false,
    schemas: {
      listQuery: AiModelListQuerySchema,
      createBody: AiModelCreateWriteSchema,
      updateBody: AiModelUpdateWriteSchema,
      auditQuery: AiModelAuditQuerySchema,
    },
    methods: {
      list: "listAiModels",
      get: "getAiModel",
      create: "createAiModel",
      update: "updateAiModel",
      delete: "deleteAiModel",
      restore: "restoreAiModel",
      audit: "getAiModelAudit",
    },
    hooks: {
      afterWrite: () => service.invalidateCache(),
      actionMiddlewares: {
        delete: [requireMfaStepUp("delete", "ai_model")],
      },
    },
  });
}
