/**
 * translations.router — central CRUD gateway for all translation schemas.
 *
 * Endpoints:
 *   GET    /api/v1/translations/public/:language        → public i18n dict (no auth)
 *   GET    /api/v1/translations/modules                  → list available modules
 *   GET    /api/v1/translations/:module/list             → paginated list (admin)
 *   POST   /api/v1/translations/:module                  → create (admin)
 *   PUT    /api/v1/translations/:module/:uuid            → update (admin)
 *   DELETE /api/v1/translations/:module/:uuid            → soft delete (admin)
 *   POST   /api/v1/translations/:module/:uuid/restore    → restore (admin)
 *
 * The public endpoint reads only public.translations (AppTranslationEntity).
 * All other endpoints require TRANSLATIONS_MANAGE permission.
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../http/protected-router.js";
import { asyncHandler } from "../../http/async-handler.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { getPool } from "../../db/pool.js";
import { TranslationsDal } from "./translations-dal.js";
import { ValidationError, NotFoundError } from "../../http/api-errors.js";

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
});

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(25),
  language: LanguageSchema.optional(),
  sort_key: z.string().optional(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
  deleted_records: z.enum(["EXCLUDED", "ONLY", "INCLUDED"]).optional(),
});

export function translationsRouter() {
  const router = makeProtectedRouter();

  // GET /api/v1/translations/public/:language — public i18n dict (no auth)
  router.get(
    "/api/v1/translations/public/:language",
    rbacHandler([Permission.PUBLIC]),
    asyncHandler(async (req, res) => {
      const langResult = LanguageSchema.safeParse(req.params.language);
      if (!langResult.success) {
        throw new ValidationError("Invalid language code", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      const dict = await dal.getI18nDict("app", langResult.data);
      res.json(dict);
    }),
  );

  // GET /api/v1/translations/:module/:language — module i18n dict (authenticated)
  router.get(
    "/api/v1/translations/:module/:language",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (req, res) => {
      const moduleResult = ModuleCodeSchema.safeParse(req.params.module);
      if (!moduleResult.success) {
        throw new ValidationError("Invalid module code", { internal_code: "VALIDATION_ERROR" });
      }
      const langResult = LanguageSchema.safeParse(req.params.language);
      if (!langResult.success) {
        throw new ValidationError("Invalid language code", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      const dict = await dal.getI18nDict(moduleResult.data, langResult.data);
      res.json(dict);
    }),
  );

  // GET /api/v1/translations/modules — list available translation modules
  router.get(
    "/api/v1/translations/modules",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      const dal = new TranslationsDal(getPool());
      res.json({ modules: dal.listModules() });
    }),
  );

  // GET /api/v1/translations/:module/list — paginated list (admin)
  router.get(
    "/api/v1/translations/:module/list",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const moduleResult = ModuleCodeSchema.safeParse(req.params.module);
      if (!moduleResult.success) {
        throw new ValidationError("Invalid module code", { internal_code: "VALIDATION_ERROR" });
      }
      const queryResult = ListQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw new ValidationError("Invalid query parameters", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      const result = await dal.list(moduleResult.data, queryResult.data);
      res.json(result);
    }),
  );

  // POST /api/v1/translations/:module — create (admin)
  router.post(
    "/api/v1/translations/:module",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const moduleResult = ModuleCodeSchema.safeParse(req.params.module);
      if (!moduleResult.success) {
        throw new ValidationError("Invalid module code", { internal_code: "VALIDATION_ERROR" });
      }
      const bodyResult = TranslationCreateSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError("Invalid request body", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      const created = await dal.create(moduleResult.data, bodyResult.data);
      res.status(201).json(created);
    }),
  );

  // PUT /api/v1/translations/:module/:uuid — update (admin)
  router.put(
    "/api/v1/translations/:module/:uuid",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const moduleResult = ModuleCodeSchema.safeParse(req.params.module);
      if (!moduleResult.success) {
        throw new ValidationError("Invalid module code", { internal_code: "VALIDATION_ERROR" });
      }
      const uuidResult = UuidSchema.safeParse(req.params.uuid);
      if (!uuidResult.success) {
        throw new ValidationError("Invalid UUID", { internal_code: "VALIDATION_ERROR" });
      }
      const bodyResult = TranslationUpdateSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError("Invalid request body", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      const updated = await dal.update(moduleResult.data, uuidResult.data, bodyResult.data);
      res.json(updated);
    }),
  );

  // DELETE /api/v1/translations/:module/:uuid — soft delete (admin)
  router.delete(
    "/api/v1/translations/:module/:uuid",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const moduleResult = ModuleCodeSchema.safeParse(req.params.module);
      if (!moduleResult.success) {
        throw new ValidationError("Invalid module code", { internal_code: "VALIDATION_ERROR" });
      }
      const uuidResult = UuidSchema.safeParse(req.params.uuid);
      if (!uuidResult.success) {
        throw new ValidationError("Invalid UUID", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      await dal.softDelete(moduleResult.data, uuidResult.data);
      res.status(204).send();
    }),
  );

  // POST /api/v1/translations/:module/:uuid/restore — restore (admin)
  router.post(
    "/api/v1/translations/:module/:uuid/restore",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const moduleResult = ModuleCodeSchema.safeParse(req.params.module);
      if (!moduleResult.success) {
        throw new ValidationError("Invalid module code", { internal_code: "VALIDATION_ERROR" });
      }
      const uuidResult = UuidSchema.safeParse(req.params.uuid);
      if (!uuidResult.success) {
        throw new ValidationError("Invalid UUID", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      await dal.restore(moduleResult.data, uuidResult.data);
      res.status(204).send();
    }),
  );

  return router;
}
