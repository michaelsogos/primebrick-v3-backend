import { Router } from "express";
import { mergedOpenApiSpec } from "./spec.js";

/**
 * Serves /api/v1/openapi.json — the merged spec (generated entity-CRUD
 * paths under the hand-written spec; see ./spec.ts).
 */
export function openApiRouter() {
  const router = Router();
  router.get("/api/v1/openapi.json", (_req, res) => {
    res.json(mergedOpenApiSpec());
  });
  return router;
}
