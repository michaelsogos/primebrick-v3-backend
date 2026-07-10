/**
 * Generic microservice proxy — forwards HTTP requests to any registered
 * microservice via the service registry.
 *
 * URL pattern: /ws/:serviceCode/v1/... → {base_url}/api/v1/...
 *
 * The proxy:
 *   1. Authenticates the caller (via rbacHandler([AUTHENTICATED_USER]) on the route)
 *   2. Looks up the service base_url by code (cached, TTL 60s)
 *   3. Serializes the resolved AuthUser into headers (GATEWAY-RESOLVED mode)
 *   4. Forwards the HTTP method + path + body + auth headers
 *   5. Returns the microservice response (status + body + headers)
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
import { findServiceByCodeCached } from "./service-registry-repo.js";

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
  const service = await findServiceByCodeCached(pool, serviceCode);
  if (!service) {
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

  // Build the target URL: {base_url}/api/{path_after_serviceCode}
  // The proxy router is mounted at "/" with route "/ws/:serviceCode/*",
  // so req.url is the full path, e.g. "/ws/EMAILSENDER/v1/providers?foo=bar".
  // We strip the "/ws/{serviceCode}" prefix and prepend "/api" so the
  // microservice receives "/api/v1/providers?foo=bar".
  const pathAfterService = req.url.replace(/^\/ws\/[^/]+/, "");
  const targetPath = `/api${pathAfterService}`;
  const targetUrl = new URL(targetPath, service.base_url).toString();

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
    // The body is already RFC 7807 JSON from the US — log it so the BE
    // console shows the source error.
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
    // US errors are already RFC 7807 JSON — the FE handles them natively.
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
      detail: `Microservice '${serviceCode}' is unreachable at ${service.base_url}`,
      internal_code: "BAD_GATEWAY",
      severity: "HIGH",
    });
  }
}
