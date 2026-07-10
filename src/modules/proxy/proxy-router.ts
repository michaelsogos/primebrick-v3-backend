/**
 * Generic proxy router — mounts /ws/:serviceCode/* and forwards to microservices.
 *
 * All proxied routes require AUTHENTICATED_USER (the microservice enforces
 * specific permissions via RBAC).
 */

import { Router } from "express";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { proxyRequest } from "./proxy-service.js";

export function proxyRouter(): Router {
  const router = Router();

  // All /ws/:serviceCode/* routes require authentication.
  // The microservice enforces specific permissions (e.g., EMAILSENDER_PROVIDERS_CREATE).
  router.all(
    "/ws/:serviceCode/*",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    proxyRequest,
  );

  return router;
}
