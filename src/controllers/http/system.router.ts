/**
 * system.router — thin controller for system-level endpoints.
 *
 * Endpoints:
 *   GET    /api/v1/system/organizations/active   → sidebar switcher orgs
 *   GET    /api/v1/system/roles/active           → role dropdown list
 *   GET    /api/v1/system/permissions            → permission catalog
 *   GET    /api/v1/system/password-policy        → active password policy
 *   GET    /api/v1/system/services               → service registry list
 *   GET    /api/v1/system/services/:code         → single service
 *   PATCH  /api/v1/system/services/:code/toggle  → toggle is_enabled
 *   DELETE /api/v1/system/services/:code         → hard delete from registry
 *   PUT    /api/v1/system/services/:code         → admin field update
 *
 * Plus mounted sub-routers: services-events (SSE) and docs-search.
 * The router contains NO business logic — all data access and shaping
 * lives in SystemService / DocsSearchService. Errors are thrown as
 * `ApiError` subclasses and converted to RFC 7807 by `errorHandler`.
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../http/protected-router.js";
import { asyncHandler } from "../../http/async-handler.js";
import { rbacHandler } from "../../modules/auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { ValidationError } from "../../http/api-errors.js";
import { SystemService } from "../../modules/system/system.service.js";
import { servicesEventsRouter } from "./services-events.router.js";
import { docsSearchRouter } from "./docs-search.router.js";

const ServiceCodeParamSchema = z.object({
  code: z.string().min(1).max(100),
});

const ServiceUpdateBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  base_url: z.string().optional(),
  icon: z.string().optional(),
  icon_type: z.string().optional(),
  author: z.string().optional(),
  github_repo_url: z.string().optional(),
});

/** Single-code param helper (rejects arrays by schema). */
const serviceCodeParam: RequestHandler = (req, _res, next) => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const r = ServiceCodeParamSchema.safeParse({ code: raw });
  if (!r.success) {
    throw new ValidationError("Invalid service code", { internal_code: "VALIDATION_ERROR" });
  }
  req.params.code = r.data.code;
  next();
};

export function systemRouter() {
  const router = makeProtectedRouter();
  const service = new SystemService();

  // Mount the SSE events endpoint for service registry
  router.use(servicesEventsRouter());
  // Mount the documentation KB search endpoint
  router.use(docsSearchRouter());

  router.get(
    "/api/v1/system/organizations/active",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      res.json(await service.listActiveOrganizations());
    }),
  );

  router.get(
    "/api/v1/system/roles/active",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      res.json(await service.listActiveRoles());
    }),
  );

  router.get(
    "/api/v1/system/permissions",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      res.json(service.listPermissionsCatalog());
    }),
  );

  router.get(
    "/api/v1/system/password-policy",
    rbacHandler([Permission.PUBLIC]),
    asyncHandler(async (_req, res) => {
      res.json(await service.getPasswordPolicy());
    }),
  );

  router.get(
    "/api/v1/system/services",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      res.json(await service.listServices());
    }),
  );

  router.get(
    "/api/v1/system/services/:code",
    rbacHandler([Permission.MODULES_READ_SINGLE]),
    serviceCodeParam,
    asyncHandler(async (req, res) => {
      res.json(await service.getService(req.params.code as string));
    }),
  );

  router.patch(
    "/api/v1/system/services/:code/toggle",
    rbacHandler([Permission.MODULES_UPDATE_SINGLE]),
    serviceCodeParam,
    asyncHandler(async (req, res) => {
      res.json(await service.toggleService(req.params.code as string));
    }),
  );

  router.delete(
    "/api/v1/system/services/:code",
    rbacHandler([Permission.MODULES_DELETE_SINGLE]),
    serviceCodeParam,
    asyncHandler(async (req, res) => {
      res.json(await service.deleteService(req.params.code as string));
    }),
  );

  router.put(
    "/api/v1/system/services/:code",
    rbacHandler([Permission.MODULES_UPDATE_SINGLE]),
    serviceCodeParam,
    asyncHandler(async (req, res) => {
      const bodyResult = ServiceUpdateBodySchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError("Invalid request body", { internal_code: "VALIDATION_ERROR" });
      }
      res.json(await service.updateService(req.params.code as string, bodyResult.data));
    }),
  );

  return router;
}
