/**
 * client-registry.router — thin controller for the `client_registry` entity
 * (`system.client_shield_registry`), the admin surface for service-identity
 * allowlist rows.
 *
 * Standard entity CRUD via `makeEntityRouter` — mandatory chain (permission,
 * uuid/body/query validation, translations permission, version query,
 * runEntityWrite tx) is non-overridable.
 *
 *   GET    /api/v1/entities/client_registry/meta           → entity metadata
 *   GET    /api/v1/entities/client_registry/list           → paginated list (registry + manual rows)
 *   GET    /api/v1/entities/client_registry/:uuid          → single record
 *   POST   /api/v1/entities/client_registry                → create manual row (client_key hashed; server-generated when absent)
 *   PUT    /api/v1/entities/client_registry/:uuid          → update manual row
 *   DELETE /api/v1/entities/client_registry/:uuid          → soft delete (manual rows only)
 *   POST   /api/v1/entities/client_registry/:uuid/restore  → restore
 *   GET    /api/v1/entities/client_registry/:uuid/audit    → audit history
 *
 * Domain guards live in `ClientShieldRegistryService`: writes on
 * `source='registry'` rows are rejected (CLIENT_REGISTRY_ROW_NOT_EDITABLE)
 * — they are owned by the service lifecycle, not admins.
 *
 * NO BULK / DUPLICATE / EXPORT — manual client rows are few and sensitive;
 * a bulk path adds no value.
 *
 * `afterWrite` broadcasts `system.client_shield_registry.changed` so every
 * service reloads its allowlist cache after an admin mutation.
 */

import { Permission, NatsClient, CLIENT_SHIELD_REGISTRY_SUBJECTS } from "@primebrick/sdk";

import { makeEntityRouter, validateUuidParam } from "../../http/entity-router.js";
import { entityWriteBody, runEntityWrite } from "../../http/entity-write.js";
import { asyncHandler } from "../../http/async-handler.js";
import { rbacHandler } from "../../modules/auth/rbac.middleware.js";
import { validateBody } from "../../http/validation.js";
import { ListAuditQuerySchema } from "../../http/list-query.js";
import { clientRegistryMeta } from "../../modules/system/client-shield-registry.meta.js";
import { ClientShieldRegistryEntity } from "../../modules/system/client_shield_registry_entity.js";
import { ClientShieldRegistryService } from "../../modules/system/client-shield-registry.service.js";
import {
  ClientRegistryListQuerySchema,
  ClientRegistryCreateEntitySchema,
  ClientRegistryUpdateEntitySchema,
  ClientRegistryRotateBodySchema,
} from "../../modules/system/client-shield-registry.dto.js";

const CreateBodySchema = entityWriteBody(ClientRegistryCreateEntitySchema);
const UpdateBodySchema = entityWriteBody(ClientRegistryUpdateEntitySchema);

export function clientRegistryRouter() {
  const service = new ClientShieldRegistryService();

  return makeEntityRouter({
    entityName: "client_registry",
    entity: ClientShieldRegistryEntity,
    meta: clientRegistryMeta,
    service,
    permissions: {
      meta: [Permission.CLIENT_REGISTRY_READ_ALL, Permission.CLIENT_REGISTRY_READ_SINGLE],
      list: [Permission.CLIENT_REGISTRY_READ_ALL],
      get: [Permission.CLIENT_REGISTRY_READ_SINGLE],
      create: [Permission.CLIENT_REGISTRY_CREATE_SINGLE],
      update: [Permission.CLIENT_REGISTRY_UPDATE_SINGLE],
      delete: [Permission.CLIENT_REGISTRY_DELETE_SINGLE],
      restore: [Permission.CLIENT_REGISTRY_RESTORE_SINGLE],
      audit: [Permission.CLIENT_REGISTRY_READ_AUDIT],
    },
    duplicate: false,
    schemas: {
      listQuery: ClientRegistryListQuerySchema,
      createBody: CreateBodySchema,
      updateBody: UpdateBodySchema,
      auditQuery: ListAuditQuerySchema,
    },
    methods: {
      list: "listClients",
      get: "getClient",
      create: "createClient",
      update: "updateClient",
      delete: "deleteClient",
      restore: "restoreClient",
      audit: "getClientAudit",
    },
    hooks: {
      afterWrite: async () => {
        await NatsClient.publish(CLIENT_SHIELD_REGISTRY_SUBJECTS.CHANGED, {});
      },
    },
    extraRoutes: [
      // POST /:uuid/rotate — key rotation (B14). Derived rows: generation
      // bump (BE pre-computes the new hash via its master secret — the
      // service's next derived key is valid immediately). Manual/static
      // rows: hash swap with grace window; server-mints a key when
      // `client_key` is absent (returned once, never stored).
      {
        method: "post",
        path: "/api/v1/entities/client_registry/:uuid/rotate",
        permission: rbacHandler([Permission.CLIENT_REGISTRY_UPDATE_SINGLE]),
        middlewares: [validateUuidParam, validateBody(ClientRegistryRotateBodySchema)],
        handler: asyncHandler(async (req, res) => {
          const body = req.body as { client_key?: string };
          const result = await runEntityWrite(undefined, (tx) =>
            service.rotateClientKey(req.params.uuid as string, body, tx),
          );
          await NatsClient.publish(CLIENT_SHIELD_REGISTRY_SUBJECTS.CHANGED, {});
          res.json(result);
        }),
      },
      // GET /:uuid/derive-secret — mint the per-service derivation secret
      // (HMAC(master, ua_prefix)) ONCE so the admin can place it in the
      // service's module config `service_key_derivation_secret`.
      {
        method: "get",
        path: "/api/v1/entities/client_registry/:uuid/derive-secret",
        permission: rbacHandler([Permission.CLIENT_REGISTRY_UPDATE_SINGLE]),
        middlewares: [validateUuidParam],
        handler: asyncHandler(async (req, res) => {
          const result = await service.deriveServiceSecret(req.params.uuid as string);
          res.json(result);
        }),
      },
    ],
  });
}
