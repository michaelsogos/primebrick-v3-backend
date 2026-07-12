/**
 * Generic microservice proxy — forwards HTTP requests to any registered
 * microservice via the service registry.
 *
 * URL pattern: /ws/:serviceCode/v1/... → {base_url}/api/v1/...
 *
 * The proxy:
 *   1. Authenticates the caller (via rbacHandler([AUTHENTICATED_USER]) on the route)
 *   2. Looks up all instances for the service code from the DB
 *   3. Filters to only status='online' instances
 *   4. If 0 online + some going_live → RFC 7807 503 (service degraded)
 *      If 0 online + 0 going_live → RFC 7807 502 (service offline)
 *   5. Round-robins among online instances
 *   6. Serializes the resolved AuthUser into headers (GATEWAY-RESOLVED mode)
 *   7. Forwards the HTTP method + path + body + auth headers
 *   8. Returns the microservice response (status + body + headers)
 *
 * Error handling:
 *   - US microservices return RFC 7807 Problem Details JSON for all errors.
 *   - The proxy passes the RFC error body through as-is — the FE already
 *     knows how to parse RFC 7807 (pushNotification auto-detects it).
 *   - The proxy logs all non-2xx US responses to the BE console with full
 *     detail, so the BE logs show the source error from the US.
 *   - If the US is unreachable (network error), the proxy returns its own
 *     RFC 7807 502 Bad Gateway.
 */

import type { Request, Response } from "express";
import { getPool } from "../../db/pool.js";
import {
  getAuthConfig,
  serializeAuthUserToHeaders,
} from "@primebrick/sdk";
import { ServiceRegistryRepo, type ServiceRegistryEntry } from "./service-registry-repo.js";

// Round-robin counters (in-memory, per process, per service code)
const rrCounters = new Map<string, number>();

/**
 * Forward a proxied request to the target microservice.
 * Reads serviceCode from req.params, path from req.url.
 */
export async function proxyRequest(req: Request, res: Response): Promise<void> {
  const serviceCode = Array.isArray(req.params.serviceCode) ? req.params.serviceCode[0] : req.params.serviceCode;
  if (!serviceCode) {
    res.status(400).json({
      type: "https://primebrick.io/errors/missing-service-code",
      title: "Missing service code",
      status: 400,
      detail: "Missing serviceCode parameter in proxy path",
      internal_code: "MISSING_SERVICE_CODE",
      severity: "LOW",
    });
    return;
  }

  const pool = getPool();
  const repo = new ServiceRegistryRepo(pool);
  const allInstances = await repo.findAllByCode(serviceCode);

  if (allInstances.length === 0) {
    res.status(404).json({
      type: "https://primebrick.io/errors/service-not-found",
      title: "Service not found",
      status: 404,
      detail: `No microservice registered with code '${serviceCode}'`,
      internal_code: "SERVICE_NOT_FOUND",
      severity: "MEDIUM",
    });
    return;
  }

  const onlineInstances = allInstances.filter((i) => i.status === "online");

  if (onlineInstances.length === 0) {
    const hasGoingLive = allInstances.some((i) => i.status === "going_live");
    if (hasGoingLive) {
      res.status(503).json({
        type: "https://primebrick.io/errors/service-degraded",
        title: "Service degraded",
        status: 503,
        detail: `Microservice '${serviceCode}' is degraded — no healthy instances available`,
        internal_code: "SERVICE_DEGRADED",
        severity: "HIGH",
      });
    } else {
      res.status(502).json({
        type: "https://primebrick.io/errors/service-offline",
        title: "Service offline",
        status: 502,
        detail: `Microservice '${serviceCode}' is offline — no instances available`,
        internal_code: "SERVICE_OFFLINE",
        severity: "CRITICAL",
      });
    }
    return;
  }

  // Round-robin among online instances
  const counter = rrCounters.get(serviceCode) ?? 0;
  const instance = onlineInstances[counter % onlineInstances.length];
  rrCounters.set(serviceCode, counter + 1);

  // Build the target URL: {base_url}/api/{path_after_serviceCode}
  const pathAfterService = req.url.replace(/^\/ws\/[^/]+/, "");
  const targetPath = `/api${pathAfterService}`;
  const targetUrl = new URL(targetPath, instance.base_url).toString();

  // Serialize the resolved AuthUser into headers for the microservice (GATEWAY-RESOLVED mode)
  let authHeaders: Record<string, string> = {};
  if (req.user) {
    const cfg = await getAuthConfig();
    authHeaders = serializeAuthUserToHeaders(req.user, cfg);
  }

  // Forward the request
  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const body = await response.text();

    // Log non-2xx responses from the US to the BE console with full detail.
    if (!response.ok) {
      let parsedBody: unknown = body;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        // Body is not JSON — log as-is
      }
      console.error(`[proxy] ${req.method} ${targetUrl} → ${response.status}`, {
        service_code: serviceCode,
        method: req.method,
        path: req.url,
        status: response.status,
        us_response: parsedBody,
      });
    }

    // Forward the response status code
    res.status(response.status);

    // Forward content-type header
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    } else {
      res.setHeader("Content-Type", "application/json");
    }

    // Pass the response body through as-is.
    res.send(body);
  } catch (err) {
    // Network error — US is unreachable
    console.error(`[proxy] Failed to reach ${targetUrl}:`, {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      service_code: serviceCode,
      target_url: targetUrl,
    });
    res.status(502).json({
      type: "https://primebrick.io/errors/bad-gateway",
      title: "Bad Gateway",
      status: 502,
      detail: `Microservice '${serviceCode}' is unreachable at ${instance.base_url}`,
      internal_code: "BAD_GATEWAY",
      severity: "HIGH",
    });
  }
}
