/**
 * config-entries.router — thin controller for the `auth_configurations` entity
 * CRUD surface (admin). Exposes the Config Table standard endpoints used by
 * the FE Security page and future Config Table pages.
 *
 * Endpoints:
 *   GET    /api/v1/entities/config_entries/meta              → entity metadata
 *   GET    /api/v1/entities/config_entries/list              → all rows (secrets masked)
 *   GET    /api/v1/entities/config_entries/:uuid             → single row (secret masked)
 *   POST   /api/v1/entities/config_entries                   → create new config row (validates value)
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
import { Permission, validateConfigValue, coerceConfigValue, serializeConfigValue, ConfigValidationError, type ConfigType } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { AuthConfigurationsDal, ReservedConfigError, ReservedConfigTypeError } from "../auth_configurations_dal.js";
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
 *
 * Typed values are coerced to their native JS type before serialization:
 *   - `bigint`  → native `bigint` (preserved by extJsonMiddleware on response)
 *   - `number`  → native `number`
 *   - `money`   → native `number` (amount only; currency is in `type_config`)
 *   - other     → string (as stored in DB)
 */
function maskSecretValue(row: AuthConfigurationEntity): Record<string, unknown> {
  // Coerce the stored string value to its native JS type based on config type.
  // For secrets, value is masked to null — the FE only sends a new value.
  let coercedValue: unknown = row.value;
  if (row.type !== "secret" && row.value !== null && row.value !== undefined) {
    try {
      coercedValue = coerceConfigValue(
        row.type as ConfigType,
        row.value,
        row.type_config ?? undefined,
      );
    } catch {
      // If coercion fails (e.g. stale DB value), fall back to the raw string.
      coercedValue = row.value;
    }
  } else if (row.type === "secret") {
    coercedValue = null;
  }

  return {
    uuid: row.uuid,
    key: row.key,
    value: coercedValue,
    type: row.type,
    type_config: row.type_config ?? null,
    label_key: row.label_key ?? null,
    description_key: row.description_key ?? null,
    group_key: row.group_key ?? null,
    reserved: row.reserved,
    version: row.version,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
    updated_by_name: (row as any).updated_by_name ?? null,
  };
}

const UuidParamSchema = z.object({
  uuid: z.string().min(1),
});

const UpdateBodySchema = z.object({
  value: z.union([z.string(), z.number(), z.bigint()]).optional(),
  type: z.string().min(1).max(50).optional(),
  type_config: z.string().nullable().optional(),
  version: z.number().int().min(1),
});

const BulkDeleteBodySchema = z.object({
  uuids: z.array(z.string().min(1)).min(1),
});

const BulkUpdateBodySchema = z.object({
  updates: z.array(
    z.object({
      uuid: z.string().min(1),
      value: z.union([z.string(), z.number(), z.bigint()]).optional(),
      type: z.string().min(1).max(50).optional(),
      type_config: z.string().nullable().optional(),
      version: z.number().int().min(1),
    })
  ).min(1),
});

const CreateBodySchema = z.object({
  key: z.string().min(1).max(100),
  value: z.union([z.string(), z.number(), z.bigint()]),
  type: z.string().min(1).max(50),
  type_config: z.string().nullable().optional(),
  label_key: z.string().max(100).nullable().optional(),
  description_key: z.string().max(100).nullable().optional(),
  group_key: z.string().max(100).nullable().optional(),
  reserved: z.boolean().optional(),
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

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof CreateBodySchema>;
    const userUuid = requireUserUuid(req);
    const dal = makeDal();

    // 1. Check for duplicate key
    const existing = await dal.findByKey(body.key);
    if (existing) {
      throw new ValidationError(
        `Config key "${body.key}" already exists`,
        { internal_code: "DUPLICATE_KEY" },
      );
    }

    // 2. Serialize the incoming typed value to its DB string form.
    //    The FE sends native bigint/number for bigint/number/money types;
    //    the DB stores TEXT, so we serialize before validation + persistence.
    const valueStr = serializeConfigValue(body.type as ConfigType, body.value);

    // 3. Validate the serialized string value using SDK validateConfigValue
    try {
      validateConfigValue(body.type as ConfigType, body.type_config ?? undefined, valueStr, body.key);
    } catch (err) {
      if (err instanceof ConfigValidationError) {
        throw new ValidationError(err.error_label_key, {
          internal_code: "VALIDATION_ERROR",
        });
      }
      throw new ValidationError(err instanceof Error ? err.message : "Invalid value", {
        internal_code: "VALIDATION_ERROR",
      });
    }

    // 4. DAL insert (pure data I/O)
    const row = await dal.add(
      {
        key: body.key,
        value: valueStr,
        type: body.type,
        type_config: body.type_config ?? null,
        label_key: body.label_key ?? null,
        description_key: body.description_key ?? null,
        group_key: body.group_key ?? null,
        reserved: body.reserved ?? false,
      },
      userUuid,
    );

    res.status(201).json(maskSecretValue(row));
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const body = req.body as z.infer<typeof UpdateBodySchema>;
    const userUuid = requireUserUuid(req);
    const dal = makeDal();

    // 1. Fetch existing row for validation
    const existing = await dal.findByUuid(uuid as string);
    if (!existing) {
      throw new ApiError(
        "/errors/not-found",
        "Config entry not found",
        404,
        `Config entry with uuid ${uuid} not found`,
        { internal_code: "NOT_FOUND" },
      );
    }

    // 2. Determine the effective type and type_config for validation.
    //    If the request includes a new type/type_config (non-reserved only),
    //    validate the value against the NEW type; otherwise use the existing.
    const effectiveType = (body.type ?? existing.type) as ConfigType;
    const effectiveTypeConfig = body.type_config !== undefined
      ? body.type_config
      : existing.type_config;

    // 3. Serialize the incoming typed value to its DB string form.
    //    If no value is provided, keep the existing value (type-only change).
    let valueStr: string;
    if (body.value !== undefined) {
      valueStr = serializeConfigValue(effectiveType, body.value);
    } else {
      valueStr = existing.value ?? "";
    }

    // 4. Validate using SDK validateConfigValue with the effective type.
    //    secret: empty string = "leave unchanged" → skip validation
    if (!(effectiveType === "secret" && valueStr === "")) {
      try {
        validateConfigValue(effectiveType, effectiveTypeConfig, valueStr, existing.key);
      } catch (err) {
        if (err instanceof ConfigValidationError) {
          throw new ValidationError(err.error_label_key, {
            internal_code: "VALIDATION_ERROR",
          });
        }
        throw new ValidationError(err instanceof Error ? err.message : "Invalid value", {
          internal_code: "VALIDATION_ERROR",
        });
      }
    }

    // 5. DAL update — enforces reserved-row rule for type/type_config changes.
    //    The DAL throws ReservedConfigTypeError if a reserved row's type or
    //    type_config is changed.
    try {
      await dal.update(
        uuid as string,
        {
          value: body.value !== undefined ? valueStr : undefined,
          type: body.type,
          type_config: body.type_config,
        },
        userUuid,
      );
    } catch (err) {
      if (err instanceof ReservedConfigTypeError) {
        throw new ApiError(
          "/errors/reserved-config-type-cannot-be-changed",
          "Reserved config type cannot be changed",
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

  const bulkUpdate: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof BulkUpdateBodySchema>;
    const userUuid = requireUserUuid(req);
    const dal = makeDal();

    // 1. Fetch all existing rows, validate each value, check optimistic concurrency,
    //    and enforce the reserved-row rule per item.
    const validUpdates: Array<{
      id: bigint;
      value?: string;
      type?: string;
      type_config?: string | null;
    }> = [];
    for (const item of body.updates) {
      const existing = await dal.findByUuid(item.uuid);
      if (!existing) {
        throw new ApiError(
          "/errors/not-found",
          "Config entry not found",
          404,
          `Config entry with uuid ${item.uuid} not found`,
          { internal_code: "NOT_FOUND" },
        );
      }

      // Optimistic concurrency check
      if (existing.version !== item.version) {
        throw new ValidationError(
          `Version mismatch for config key "${existing.key}": expected ${item.version}, got ${existing.version}`,
          { internal_code: "VERSION_MISMATCH" },
        );
      }

      // Reserved-row rule: type and type_config cannot be changed on reserved rows.
      if (existing.reserved) {
        if (item.type !== undefined && item.type !== existing.type) {
          throw new ApiError(
            "/errors/reserved-config-type-cannot-be-changed",
            "Reserved config type cannot be changed",
            403,
            `Config key "${existing.key}" is reserved: type and type_config cannot be changed`,
            {
              internal_code: "reserved_config_type_cannot_be_changed",
              severity: "MEDIUM",
              extra: { key: existing.key },
            },
          );
        }
        if (
          item.type_config !== undefined &&
          item.type_config !== (existing.type_config ?? null)
        ) {
          throw new ApiError(
            "/errors/reserved-config-type-cannot-be-changed",
            "Reserved config type cannot be changed",
            403,
            `Config key "${existing.key}" is reserved: type and type_config cannot be changed`,
            {
              internal_code: "reserved_config_type_cannot_be_changed",
              severity: "MEDIUM",
              extra: { key: existing.key },
            },
          );
        }
      }

      // Determine effective type for validation/serialization
      const effectiveType = (item.type ?? existing.type) as ConfigType;
      const effectiveTypeConfig = item.type_config !== undefined
        ? item.type_config
        : existing.type_config;

      // Serialize the incoming typed value to its DB string form.
      let valueStr: string | undefined;
      if (item.value !== undefined) {
        valueStr = serializeConfigValue(effectiveType, item.value);
      }

      // secret: empty string = "leave unchanged" → skip value validation + write
      if (effectiveType === "secret" && valueStr === "") {
        // Still allow type/type_config updates for non-reserved rows
        validUpdates.push({
          id: existing.id!,
          type: item.type,
          type_config: item.type_config,
        });
        continue;
      }

      // Validate using SDK with the effective type
      if (valueStr !== undefined) {
        try {
          validateConfigValue(effectiveType, effectiveTypeConfig, valueStr, existing.key);
        } catch (err) {
          if (err instanceof ConfigValidationError) {
            throw new ValidationError(err.error_label_key, {
              internal_code: "VALIDATION_ERROR",
            });
          }
          throw new ValidationError(err instanceof Error ? err.message : "Invalid value", {
            internal_code: "VALIDATION_ERROR",
          });
        }
      }

      validUpdates.push({
        id: existing.id!,
        value: valueStr,
        type: item.type,
        type_config: item.type_config,
      });
    }

    // 2. Single transactional bulk write via DAL (TEMP TABLE strategy)
    if (validUpdates.length > 0) {
      await dal.bulkUpdate(validUpdates, userUuid);
    }
    res.json({ success: true, updated: validUpdates.length });
  });

  const getAudit: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const limit = parseInt(String(req.query.limit ?? "50"), 10);

    // Verify the config entry exists
    const dal = makeDal();
    const existing = await dal.findByUuid(uuid);
    if (!existing) {
      throw new ApiError(
        "/errors/not-found",
        "Config entry not found",
        404,
        `Config entry with uuid ${uuid} not found`,
        { internal_code: "NOT_FOUND" },
      );
    }

    // Use the shared audit query helper
    const { findAuditPage } = await import("../../../db/audit-query-helper.js");
    const { Repository } = await import("@primebrick/dal-pg");
    const pool = getPool();
    const repo = new Repository(pool);
    const result = await findAuditPage(repo, {
      tableName: "auth_configurations_audit",
      entityUuid: uuid,
      page,
      limit,
    });
    res.json(result);
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
      method: "post",
      path: "/api/v1/entities/config_entries",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(CreateBodySchema)],
      handler: create,
    },
    {
      method: "put",
      path: "/api/v1/entities/config_entries/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(UpdateBodySchema)],
      handler: update,
    },
    {
      method: "put",
      path: "/api/v1/entities/config_entries/bulk-update",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      middlewares: [validateBody(BulkUpdateBodySchema)],
      handler: bulkUpdate,
    },
    {
      method: "get",
      path: "/api/v1/entities/config_entries/:uuid/audit",
      permission: rbacHandler([Permission.AUTHENTICATED_ADMIN]),
      handler: getAudit,
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
