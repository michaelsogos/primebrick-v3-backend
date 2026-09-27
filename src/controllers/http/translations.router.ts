/**
 * translations.router — thin controller for the translation CRUD gateway.
 *
 * Endpoints:
 *   PUBLIC READ (no auth):
 *     GET /api/v1/system/translations/public/:language
 *   RUNTIME READ (authenticated):
 *     GET /api/v1/system/translations/:module/:language
 *   ADMIN CRUD (translation.* perms — standard entity pattern):
 *     GET    /api/v1/entities/translation/list?module={code}
 *     POST   /api/v1/entities/translation?module={code}
 *     PUT    /api/v1/entities/translation/:uuid?module={code}
 *     DELETE /api/v1/entities/translation/:uuid?module={code}
 *     POST   /api/v1/entities/translation/:uuid/restore?module={code}
 *
 * The router contains NO business logic — all DAL access and cache handling
 * lives in TranslationsService. Errors are thrown as `ApiError` subclasses
 * and converted to RFC 7807 by the centralized `errorHandler`.
 */

import type { RequestHandler } from "express";
import { z } from "zod";
import { zBoundedInt } from "../../http/validation.js";

import { makeProtectedRouter } from "../../http/protected-router.js";
import { asyncHandler } from "../../http/async-handler.js";
import { rbacHandler } from "../../modules/auth/rbac.middleware.js";
import { Permission, type CacheEntry, type I18nDict } from "@primebrick/sdk";
import { ValidationError } from "../../http/api-errors.js";
import { etagMiddleware } from "../../http/etag-middleware.js";
import { entityOnlyWriteBody } from "../../http/entity-write.js";
import { TranslationsService } from "../../modules/system/translations.service.js";

const ModuleCodeSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-z][a-z0-9_-]*$/, { message: "Module code must be snake_case" });

const LanguageSchema = z
  .string()
  .min(2)
  .max(10)
  .regex(/^[a-z]{2}-[A-Z]{2}$/, { message: "Language must be BCP 47 (e.g. en-GB)" });

const UuidSchema = z.string().uuid();

const TranslationCreateSchema = z.object({
  key: z.string().min(1).max(255),
  language: LanguageSchema,
  value: z.string(),
});

const TranslationUpdateSchema = z.object({
  key: z.string().min(1).max(255).optional(),
  language: LanguageSchema.optional(),
  value: z.string().optional(),
  version: zBoundedInt(0, Number.MAX_SAFE_INTEGER),
});

// Write-payload standard: `{entity}` — a translation row never carries
// piggybacked translations (entityOnlyWriteBody rejects the sibling).
const TranslationCreateWriteSchema = entityOnlyWriteBody(TranslationCreateSchema);
const TranslationUpdateWriteSchema = entityOnlyWriteBody(TranslationUpdateSchema);

const ListQuerySchema = z.object({
  module: ModuleCodeSchema,
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(25),
  language: LanguageSchema.optional(),
  sort_key: z.string().optional(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
  deleted_records: z.enum(["EXCLUDED", "ONLY", "INCLUDED"]).optional(),
});

const ModuleQuerySchema = z.object({
  module: ModuleCodeSchema,
});

function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown, detail: string): T {
  const r = schema.safeParse(value);
  if (!r.success) {
    throw new ValidationError(detail, { internal_code: "VALIDATION_ERROR" });
  }
  return r.data;
}

export function translationsRouter() {
  const router = makeProtectedRouter();
  const service = new TranslationsService();

  // Transport helpers: shared param validators.
  const validateModuleParam: RequestHandler = (req, _res, next) => {
    req.params.module = parseOrThrow(ModuleCodeSchema, req.params.module as string, "Invalid module code");
    next();
  };
  const validateLanguageParam: RequestHandler = (req, _res, next) => {
    req.params.language = parseOrThrow(LanguageSchema, req.params.language as string, "Invalid language code");
    next();
  };
  const validateModuleQuery: RequestHandler = (req, _res, next) => {
    parseOrThrow(ModuleQuerySchema, req.query, "Missing or invalid module query param");
    next();
  };
  const validateUuidParam: RequestHandler = (req, _res, next) => {
    req.params.uuid = parseOrThrow(UuidSchema, req.params.uuid as string, "Invalid UUID");
    next();
  };
  const writeModule = (req: { query: unknown }): string =>
    parseOrThrow(ModuleQuerySchema, req.query, "Missing or invalid module query param").module;

  // ─── PUBLIC READ (no auth) ──────────────────────────────────────────────
  router.get(
    "/api/v1/system/translations/public/:language",
    rbacHandler([Permission.PUBLIC]),
    validateLanguageParam,
    asyncHandler(async (req, res, next) => {
      res.locals.cacheEntry = await service.getI18nDict("app", req.params.language as string);
      next();
    }),
    etagMiddleware(),
    asyncHandler(async (_req, res) => {
      res.json((res.locals.cacheEntry as CacheEntry<I18nDict>).data);
    }),
  );

  // ─── RUNTIME READ (authenticated user) ──────────────────────────────────
  router.get(
    "/api/v1/system/translations/:module/:language",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    validateModuleParam,
    validateLanguageParam,
    asyncHandler(async (req, res, next) => {
      res.locals.cacheEntry = await service.getI18nDict(req.params.module as string, req.params.language as string);
      next();
    }),
    etagMiddleware(),
    asyncHandler(async (_req, res) => {
      res.json((res.locals.cacheEntry as CacheEntry<I18nDict>).data);
    }),
  );

  // ─── ADMIN CRUD (translation.* perms — standard entity pattern) ─────────
  router.get(
    "/api/v1/entities/translation/list",
    rbacHandler([Permission.TRANSLATION_READ_ALL]),
    asyncHandler(async (req, res) => {
      const query = parseOrThrow(ListQuerySchema, req.query, "Invalid query parameters");
      res.json(await service.list(query.module, query));
    }),
  );

  router.post(
    "/api/v1/entities/translation",
    rbacHandler([Permission.TRANSLATION_CREATE_SINGLE]),
    asyncHandler(async (req, res) => {
      const body = parseOrThrow(TranslationCreateWriteSchema, req.body, "Invalid request body");
      const created = await service.create(writeModule(req), body.entity);
      res.status(201).json(created);
    }),
  );

  router.put(
    "/api/v1/entities/translation/:uuid",
    rbacHandler([Permission.TRANSLATION_UPDATE_SINGLE]),
    validateUuidParam,
    asyncHandler(async (req, res) => {
      const body = parseOrThrow(TranslationUpdateWriteSchema, req.body, "Invalid request body");
      res.json(await service.update(writeModule(req), req.params.uuid as string, body.entity));
    }),
  );

  router.delete(
    "/api/v1/entities/translation/:uuid",
    rbacHandler([Permission.TRANSLATION_DELETE_SINGLE]),
    validateModuleQuery,
    validateUuidParam,
    asyncHandler(async (req, res) => {
      await service.softDelete(writeModule(req), req.params.uuid as string);
      res.status(204).send();
    }),
  );

  router.post(
    "/api/v1/entities/translation/:uuid/restore",
    rbacHandler([Permission.TRANSLATION_RESTORE_SINGLE]),
    validateModuleQuery,
    validateUuidParam,
    asyncHandler(async (req, res) => {
      await service.restore(writeModule(req), req.params.uuid as string);
      res.status(204).send();
    }),
  );

  return router;
}
