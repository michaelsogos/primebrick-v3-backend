/**
 * ai-cerebellum.router — thin controller for the `ai_cerebellum` entity.
 *
 * Standard entity CRUD via `makeEntityRouter` — mandatory chain (permission,
 * uuid/body/query validation, translations permission, version query,
 * runEntityWrite tx) is non-overridable. Delete requires MFA step-up; writes
 * invalidate the cerebellum cache.
 *
 *   GET    /api/v1/entities/ai_cerebellum/meta
 *   GET    /api/v1/entities/ai_cerebellum/list
 *   GET    /api/v1/entities/ai_cerebellum/:uuid
 *   POST   /api/v1/entities/ai_cerebellum
 *   PUT    /api/v1/entities/ai_cerebellum/:uuid
 *   DELETE /api/v1/entities/ai_cerebellum/:uuid        → MFA step-up
 *   POST   /api/v1/entities/ai_cerebellum/:uuid/restore
 *   GET    /api/v1/entities/ai_cerebellum/:uuid/audit
 */

import { Permission } from "@primebrick/sdk";

import { makeEntityRouter } from "../../http/entity-router.js";
import { entityWriteBody } from "../../http/entity-write.js";
import { requireMfaStepUp } from "../../modules/auth/mfa-step-up.middleware.js";
import {
  AiCerebellumListQuerySchema,
  AiCerebellumCreateBodySchema,
  AiCerebellumUpdateBodySchema,
  AiCerebellumAuditQuerySchema,
} from "../../modules/ai-cerebellum/dto.js";
import { aiCerebellumMeta } from "../../modules/ai-cerebellum/ai_cerebellum.meta.js";
import { AiCerebellumEntity } from "../../modules/ai-cerebellum/ai_cerebellum_entity.js";
import { AiCerebellumService } from "../../modules/ai-cerebellum/ai_cerebellum.service.js";

// Write-payload standard: `{entity, translations?}` (src/http/entity-write.ts)
const AiCerebellumCreateWriteSchema = entityWriteBody(AiCerebellumCreateBodySchema);
const AiCerebellumUpdateWriteSchema = entityWriteBody(AiCerebellumUpdateBodySchema);

export function aiCerebellumRouter() {
  const service = new AiCerebellumService();

  return makeEntityRouter({
    entityName: "ai_cerebellum",
    entity: AiCerebellumEntity,
    meta: aiCerebellumMeta,
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
      listQuery: AiCerebellumListQuerySchema,
      createBody: AiCerebellumCreateWriteSchema,
      updateBody: AiCerebellumUpdateWriteSchema,
      auditQuery: AiCerebellumAuditQuerySchema,
    },
    methods: {
      list: "listAiCerebellum",
      get: "getAiCerebellum",
      create: "createAiCerebellum",
      update: "updateAiCerebellum",
      delete: "deleteAiCerebellum",
      restore: "restoreAiCerebellum",
      audit: "getAiCerebellumAudit",
    },
    hooks: {
      afterWrite: () => service.invalidateCache(),
      actionMiddlewares: {
        delete: [requireMfaStepUp("delete", "ai_cerebellum")],
      },
    },
  });
}
