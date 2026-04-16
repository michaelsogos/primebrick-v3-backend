import { Router } from "express";
import { openapi } from "./openapi.js";

export function openApiRouter() {
  const router = Router();
  router.get("/api/v1/openapi.json", (_req, res) => {
    res.json(openapi);
  });
  return router;
}

