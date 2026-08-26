/**
 * config-entries.router — thin controller for the `auth_configurations` entity
 * CRUD surface (admin). Exposes the Config Table standard endpoints used by
 * the FE Security page and future Config Table pages.
 *
 * Endpoints:
 *   GET    /api/v1/entities/config_entries/meta              → entity metadata
 *   GET    /api/v1/entities/config_entries/list              → all rows (secrets masked)
 *   GET    /api/v1/entities/config_entries/:uuid             → single row (secret masked)
 *   PUT    /api/v1/entities/config_entries/:uuid             → update value (validates type)
 *   DELETE /api/v1/entities/config_entries/:uuid             → soft-delete (reserved rejected, step-up MFA)
 *   POST   /api/v1/entities/config_entries/bulk-delete       → bulk soft-delete (reserved rejected, step-up MFA)
 *   POST   /api/v1/entities/config_entries/:uuid/restore     → restore soft-deleted row
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { AuthConfigurationsDal, ReservedConfigError } from "../auth_configurations_dal.js";
import { AuthConfigurationEntity } from "../auth_configuration_entity.js";
import { configEntriesMeta } from "../config-entries.meta.js";
import { assembleMeta } from "../../../http/meta-assembler.js";
import { requireMfaStepUp } from "../mfa-step-up.middleware.js";
import { ApiError, ValidationError } from "../../../http/api-errors.js";

function makeDal(): AuthConfigurationsDal {
  return new AuthConfigurationsDal(getPool());
}

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

/**
 * Mask secret values in a config row before returning it to the FE.
 * Secret values are replaced with `null` — the FE renders a Password input
 * with a placeholder and only sends a value when the user types a new one.
 * An empty PUT body for a secret means "leave unchanged".
 */
function maskSecretValue(row: AuthConfigurationEntity): Record<string, unknown> {
  return {
    uuid: row.uuid,
    key: row.key,
    value: row.type === "secret" ? null : row.value,
    type: row.type,
    type_config: row.type_config ?? null,
    label_key: row.label_key ?? null,
    description_key: row.description_key ?? null,
    reserved: row.reserved,
    version: row.version,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
  };
}

const UuidParamSchema = z.object({
  uuid: z.string().min(1),
});

const UpdateBodySchema = z.object({
  value: z.string(),
  version: z.number().int().min(1),
});

const BulkDeleteBodySchema = z.object({
  uuids: z.array(z.string().min(1)).min(1),
});

export function configEntriesRouter() {
  const router = makeProtectedRouter();

  const getMeta: RequestHandler = asyncHandler(async (_req, res) => {
    res.json(assembleMeta(configEntriesMeta, AuthConfigurationEntity));
  });

  const list: RequestHandler = asyncHandler(async (_req, res) => {
    const dal = makeDal();
    const rows = await dal.findAll();
    res.json({ rows: rows.map(maskSecretValue) });
  });

  const getSingle: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const dal = makeDal();
    const row = await dal.findByUuid(uuid as string);
    if (!row) {
      throw new ApiError(
        "/errors/not-found",
        "Config entry not found",
        404,
        `Config entry with uuid ${uuid} not found`,
        { internal_code: "NOT_FOUND" },
      );
    }
    res.json(maskSecretValue(row));
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const body = req.body as z.infer<typeof UpdateBodySchema>;
    const userUuid = requireUserUuid(req);
    const dal = makeDal();
    try {
      await dal.update(uuid as string, body.value, userUuid);
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) {
        throw new ApiError(
          "/errors/not-found",
          "Config entry not found",
          404,
          err.message,
          { internal_code: "NOT_FOUND" },
        );
      }
      // Type validation errors → 400
      throw new ValidationError(err instanceof Error ? err.message : "Invalid value", {
        internal_code: "VALIDATION_ERROR",
      });
    }
    res.json({ success: true });
  });

  const softDelete: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const userUuid = requireUserUuid(req);
    const dal = makeDal();
    try {
      await dal.softDelete(uuid as string, userUuid);
    } catch (err) {
      if (err instanceof ReservedConfigError) {
        throw new ApiError(
          "/errors/reserved-config-cannot-be-deleted",
          "Reserved config cannot be deleted",
          403,
          err.message,
          {
            internal_code: err.internal_code,
            severity: "MEDIUM",
            extra: { key: err.key },
          },
        );
      }
      if (err instanceof Error && err.message.includes("not found")) {
        throw new ApiError(
          "/errors/not-found",
          "Config entry not found",
          404,
          err.message,
          { internal_code: "NOT_FOUND" },
        );
      }
      throw err;
    }
    res.json({ success: true });
  });

  const bulkDelete: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof BulkDeleteBodySchema>;
    const userUuid = requireUserUuid(req);
    const dal = makeDal();
    try {
      await dal.bulkSoftDelete(body.uuids, userUuid);
    } catch (err) {
      if (err instanceof ReservedConfigError) {
        throw new ApiError(
          "/errors/reserved-config-cannot-be-deleted",
          "Reserved config cannot be deleted",
          403,
          err.message,
          {
            internal_code: err.internal_code,
            severity: "MEDIUM",
            extra: { key: err.key },
          },
        );
      }
      if (err instanceof Error && err.message.includes("not found")) {
        throw new ApiError(
          "/errors/not-found",
          "Config entry not found",
          404,
          err.message,
          { internal_code: "NOT_FOUND" },
        );
      }
      throw err;
    }
    res.json({ success: true });
  });

  const restore: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const userUuid = requireUserUuid(req);
    const dal = makeDal();
    try {
      await dal.restore(uuid as string, userUuid);
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) {
        throw new ApiError(
          "/errors/not-found",
          "Config entry not found",
          404,
          err.message,
          { internal_code: "NOT_FOUND" },
        );
      }
      throw err;
    }
    res.json({ success: true });
  });

  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/entities/config_entries/meta",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/config_entries/list",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: list,
    },
    {
      method: "get",
      path: "/api/v1/entities/config_entries/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: getSingle,
    },
    {
      method: "put",
      path: "/api/v1/entities/config_entries/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(UpdateBodySchema)],
      handler: update,
    },
    {
      method: "delete",
      path: "/api/v1/entities/config_entries/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [requireMfaStepUp("delete", "config_entries")],
      handler: softDelete,
    },
    {
      method: "post",
      path: "/api/v1/entities/config_entries/bulk-delete",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(BulkDeleteBodySchema), requireMfaStepUp("bulk_delete", "config_entries")],
      handler: bulkDelete,
    },
    {
      method: "post",
      path: "/api/v1/entities/config_entries/:uuid/restore",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: restore,
    },
  ]);

  return router;
}
