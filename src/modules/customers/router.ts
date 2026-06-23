/**
 * customers.router — thin controller for the `customer` entity.
 *
 * Endpoints:
 *   GET    /api/v1/entities/customer/meta            → entity metadata
 *   GET    /api/v1/entities/customer/list            → paginated list
 *   GET    /api/v1/entities/customer/export          → streamed export (csv/xlsx/html)
 *   POST   /api/v1/entities/customer                 → create
 *   POST   /api/v1/entities/customer/duplicate       → bulk duplicate
 *   GET    /api/v1/entities/customer/:uuid           → single record
 *   PUT    /api/v1/entities/customer/:uuid           → update
 *   DELETE /api/v1/entities/customer/:uuid           → soft delete
 *   POST   /api/v1/entities/customer/:uuid/restore   → restore soft-deleted
 *   POST   /api/v1/entities/customer/bulk-delete     → bulk soft delete
 *   POST   /api/v1/entities/customer/bulk-restore    → bulk restore
 *   GET    /api/v1/entities/customer/:uuid/audit     → audit history
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
import { Permission } from "../auth/permissions.js";
import { runBulkAction, sendBulkOutcome } from "../../lib/bulk/bulk-action-runner.js";
import {
  CustomerCreateBodySchema,
  CustomerUpdateBodySchema,
  CustomerListQuerySchema,
  CustomerExportQuerySchema,
  UuidParamSchema,
  CustomerDuplicateBodySchema,
  CustomerAuditQuerySchema,
} from "./dto.js";
import { customerMeta } from "./customers.meta.js";
import { CustomersService } from "./customers.service.js";
import { ValidationError } from "../../http/api-errors.js";

const BulkUuidsSchema = z.object({
  uuids: z.array(z.string().uuid()).min(1).max(100),
});

/** Inline UUID param validation middleware (preserves the original behavior). */
function validateUuidParam(req: any, _res: any, next: any): void {
  const r = UuidParamSchema.safeParse(req.params);
  if (!r.success) {
    throw new ValidationError("Request validation failed", { internal_code: "VALIDATION_ERROR" });
  }
  req.params = r.data;
  next();
}

export function customersRouter() {
  const router = makeProtectedRouter();
  const service = new CustomersService();

  const getMeta: RequestHandler = (_req, res) => {
    res.json(customerMeta);
  };

  const list: RequestHandler = asyncHandler(async (req, res) => {
    const query = req.query as unknown as import("./dto.js").CustomerListQuery;
    try {
      const result = await service.listCustomers(query);
      res.json(result);
    } catch (e) {
      // DB-down errors are forwarded so the global handler can emit
      // DATABASE_UNAVAILABLE + CRITICAL.
      if (isDatabaseUnavailableError(e)) throw e;
      throw e;
    }
  });

  const exportCustomers: RequestHandler = asyncHandler(async (req, res) => {
    const query = req.query as unknown as import("./dto.js").CustomerExportQuery;
    try {
      await service.exportCustomers(query, res);
    } catch (e) {
      if (isDatabaseUnavailableError(e)) throw e;
      throw e;
    }
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as unknown as import("./dto.js").CustomerCreateBody;
    const created = await service.createCustomer(body);
    res.status(201).json(created);
  });

  const duplicate: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as unknown as import("./dto.js").CustomerDuplicateBody;
    const result = await service.duplicateCustomers(body.uuids);
    res.status(200).json(result);
  });

  const getSingle: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const found = await service.getCustomer(uuid);
    res.json(found);
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const body = req.body as unknown as import("./dto.js").CustomerUpdateBody;
    await service.updateCustomer(uuid, body);
    res.status(204).send();
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    await service.deleteCustomer(uuid);
    res.status(204).send();
  });

  const restore: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    await service.restoreCustomer(uuid);
    res.status(204).send();
  });

  const bulkDelete: RequestHandler = asyncHandler(async (req, res) => {
    const { uuids } = req.body as { uuids: string[] };
    const outcome = await runBulkAction({
      kind: "delete",
      uuids,
      instance: req.originalUrl,
      entityLabel: "customer",
      run: (uuid) => service.deleteCustomer(uuid),
    });
    sendBulkOutcome(res, outcome);
  });

  const bulkRestore: RequestHandler = asyncHandler(async (req, res) => {
    const { uuids } = req.body as { uuids: string[] };
    const outcome = await runBulkAction({
      kind: "restore",
      uuids,
      instance: req.originalUrl,
      entityLabel: "customer",
      run: (uuid) => service.restoreCustomer(uuid),
    });
    sendBulkOutcome(res, outcome);
  });

  const getAudit: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const { page, limit } = req.query as unknown as import("./dto.js").CustomerAuditQuery;
    const result = await service.getCustomerAudit(uuid, page, limit);
    res.json(result);
  });

  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/entities/customer/meta",
      permission: rbacHandler([Permission.CUSTOMERS_READ_ALL, Permission.CUSTOMERS_READ_SINGLE]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/customer/list",
      permission: rbacHandler([Permission.CUSTOMERS_READ_ALL]),
      middlewares: [validateQuery(CustomerListQuerySchema)],
      handler: list,
    },
    {
      method: "get",
      path: "/api/v1/entities/customer/export",
      permission: rbacHandler([Permission.CUSTOMERS_EXPORT]),
      middlewares: [validateQuery(CustomerExportQuerySchema)],
      handler: exportCustomers,
    },
    {
      method: "post",
      path: "/api/v1/entities/customer",
      permission: rbacHandler([Permission.CUSTOMERS_CREATE_SINGLE]),
      middlewares: [validateBody(CustomerCreateBodySchema)],
      handler: create,
    },
    {
      method: "post",
      path: "/api/v1/entities/customer/duplicate",
      permission: rbacHandler([Permission.CUSTOMERS_DUPLICATE_BULK]),
      middlewares: [validateBody(CustomerDuplicateBodySchema)],
      handler: duplicate,
    },
    {
      method: "get",
      path: "/api/v1/entities/customer/:uuid",
      permission: rbacHandler([Permission.CUSTOMERS_READ_SINGLE]),
      middlewares: [validateUuidParam],
      handler: getSingle,
    },
    {
      method: "put",
      path: "/api/v1/entities/customer/:uuid",
      permission: rbacHandler([Permission.CUSTOMERS_UPDATE_SINGLE]),
      middlewares: [validateUuidParam, validateBody(CustomerUpdateBodySchema)],
      handler: update,
    },
    {
      method: "delete",
      path: "/api/v1/entities/customer/:uuid",
      permission: rbacHandler([Permission.CUSTOMERS_DELETE_SINGLE]),
      middlewares: [validateUuidParam],
      handler: remove,
    },
    {
      method: "post",
      path: "/api/v1/entities/customer/:uuid/restore",
      permission: rbacHandler([Permission.CUSTOMERS_RESTORE_SINGLE]),
      middlewares: [validateUuidParam],
      handler: restore,
    },
    {
      method: "post",
      path: "/api/v1/entities/customer/bulk-delete",
      permission: rbacHandler([Permission.CUSTOMERS_DELETE_BULK]),
      middlewares: [validateBody(BulkUuidsSchema)],
      handler: bulkDelete,
    },
    {
      method: "post",
      path: "/api/v1/entities/customer/bulk-restore",
      permission: rbacHandler([Permission.CUSTOMERS_RESTORE_BULK]),
      middlewares: [validateBody(BulkUuidsSchema)],
      handler: bulkRestore,
    },
    {
      method: "get",
      path: "/api/v1/entities/customer/:uuid/audit",
      permission: rbacHandler([Permission.CUSTOMERS_READ_AUDIT]),
      middlewares: [validateUuidParam, validateQuery(CustomerAuditQuerySchema)],
      handler: getAudit,
    },
  ]);

  return router;
}
