/**
 * Generic proxy router — mounts /ws/:serviceCode/* and forwards to microservices.
 *
 * All proxied routes require AUTHENTICATED_USER (the microservice enforces
 * specific permissions via RBAC).
 */

import { Router } from "express";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { proxyRequest, proxyRequestSse } from "./proxy-service.js";

export function proxyRouter(): Router {
  const router = Router();

  // All /ws/:serviceCode/* routes require authentication.
  // The microservice enforces specific permissions (e.g., EMAILSENDER_PROVIDERS_CREATE).
  router.all(
    "/ws/:serviceCode/*",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    proxyRequest,
  );

  // AI microservice proxy — streaming (SSE) variant.
  // Hardcoded service code 'ai' (single AI microservice in v1).
  // Uses proxyRequestSse which pipes the upstream response without buffering,
  // preserving Server-Sent Events chunk-by-chunk streaming for the chat endpoint.
  router.all(
    "/api/v1/ai/*",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    proxyRequestSse,
  );

  return router;
}
