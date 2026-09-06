/**
 * translations.router — central CRUD gateway for all translation schemas.
 *
 * DESIGN:
 * - Public read: no auth, returns flat i18n dict for app.* keys
 * - Runtime read: authenticated, returns flat i18n dict for any module
 * - Admin CRUD: follows the standard entity pattern under
 *   /api/v1/entities/translation/ with module as a query param
 *
 * The module list for the admin selector comes from the existing
 * /api/v1/modules endpoint (service_registry) — NOT from this router.
 * The FE adds the static 'app' and 'system' entries locally.
 *
 * Endpoints:
 *   PUBLIC READ (no auth):
 *     GET /api/v1/system/translations/public/:language
 *       → flat i18n dict from public.translations (app.* keys)
 *
 *   RUNTIME READ (authenticated user):
 *     GET /api/v1/system/translations/:module/:language
 *       → flat i18n dict from {schema}.translations
 *
 *   ADMIN CRUD (TRANSLATIONS_MANAGE — standard entity pattern):
 *     GET    /api/v1/entities/translation/list?module={code}&language={lang}&page=1&page_size=25
 *     POST   /api/v1/entities/translation?module={code}
 *     PUT    /api/v1/entities/translation/:uuid?module={code}
 *     DELETE /api/v1/entities/translation/:uuid?module={code}
 *     POST   /api/v1/entities/translation/:uuid/restore?module={code}
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
import { ValidationError } from "../../http/api-errors.js";

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

export function translationsRouter() {
  const router = makeProtectedRouter();

  // ─── PUBLIC READ (no auth) ──────────────────────────────────────────────
  // Returns flat i18n dict from public.translations (app.* keys only).
  // Used by login, welcome, and MCP consent pages before authentication.
  router.get(
    "/api/v1/system/translations/public/:language",
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

  // ─── RUNTIME READ (authenticated user) ──────────────────────────────────
  // Returns flat i18n dict for any module's schema.
  // Used by useModuleTranslations composable on authenticated pages.
  router.get(
    "/api/v1/system/translations/:module/:language",
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

  // ─── ADMIN CRUD (TRANSLATIONS_MANAGE — standard entity pattern) ─────────
  // Follows the same pattern as /api/v1/entities/customer, /api/v1/entities/organization, etc.
  // Module is a query param (not a path param) — same as the plan specified.

  // GET /api/v1/entities/translation/list?module={code}&language={lang}&page=1&page_size=25
  router.get(
    "/api/v1/entities/translation/list",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const queryResult = ListQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw new ValidationError("Invalid query parameters", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      const result = await dal.list(queryResult.data.module, queryResult.data);
      res.json(result);
    }),
  );

  // POST /api/v1/entities/translation?module={code} — create
  router.post(
    "/api/v1/entities/translation",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const queryResult = ModuleQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw new ValidationError("Missing or invalid module query param", { internal_code: "VALIDATION_ERROR" });
      }
      const bodyResult = TranslationCreateSchema.safeParse(req.body);
      if (!bodyResult.success) {
        throw new ValidationError("Invalid request body", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      const created = await dal.create(queryResult.data.module, bodyResult.data);
      res.status(201).json(created);
    }),
  );

  // PUT /api/v1/entities/translation/:uuid?module={code} — update
  router.put(
    "/api/v1/entities/translation/:uuid",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const queryResult = ModuleQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw new ValidationError("Missing or invalid module query param", { internal_code: "VALIDATION_ERROR" });
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
      const updated = await dal.update(queryResult.data.module, uuidResult.data, bodyResult.data);
      res.json(updated);
    }),
  );

  // DELETE /api/v1/entities/translation/:uuid?module={code} — soft delete
  router.delete(
    "/api/v1/entities/translation/:uuid",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const queryResult = ModuleQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw new ValidationError("Missing or invalid module query param", { internal_code: "VALIDATION_ERROR" });
      }
      const uuidResult = UuidSchema.safeParse(req.params.uuid);
      if (!uuidResult.success) {
        throw new ValidationError("Invalid UUID", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      await dal.softDelete(queryResult.data.module, uuidResult.data);
      res.status(204).send();
    }),
  );

  // POST /api/v1/entities/translation/:uuid/restore?module={code} — restore
  router.post(
    "/api/v1/entities/translation/:uuid/restore",
    rbacHandler([Permission.TRANSLATIONS_MANAGE]),
    asyncHandler(async (req, res) => {
      const queryResult = ModuleQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw new ValidationError("Missing or invalid module query param", { internal_code: "VALIDATION_ERROR" });
      }
      const uuidResult = UuidSchema.safeParse(req.params.uuid);
      if (!uuidResult.success) {
        throw new ValidationError("Invalid UUID", { internal_code: "VALIDATION_ERROR" });
      }
      const dal = new TranslationsDal(getPool());
      await dal.restore(queryResult.data.module, uuidResult.data);
      res.status(204).send();
    }),
  );

  return router;
}
