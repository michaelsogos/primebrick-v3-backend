/**
 * Aggregated OpenAPI route handler — serves a merged OpenAPI spec at
 * GET /api/v1/openapi/aggregated.json.
 *
 * Merges the BE's own OpenAPI spec with specs from all online microservices
 * registered in the service_registry. Microservice paths are prefixed with
 * /svc/:serviceCode so they match the existing proxy.
 *
 * Public endpoint (no auth) — mounted before the auth guard, same as the
 * existing /api/v1/openapi.json endpoint.
 */

import { logger, extJsonParse, extJsonStringify } from "@primebrick/sdk";
import { Router } from "express";
import { mergedOpenApiSpec } from "./spec.js";
import { ServiceRegistryService } from "../modules/system/service-registry.service.js";
import { internalFetch } from "@primebrick/sdk";

// In-memory cache to avoid hammering microservices on every request
let cachedSpec: { spec: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 30_000;

export function aggregatedOpenApiRouter() {
  const router = Router();

  router.get("/api/v1/openapi/aggregated.json", async (_req, res) => {
    // Return cached spec if fresh
    if (cachedSpec && Date.now() - cachedSpec.timestamp < CACHE_TTL_MS) {
      res.json(cachedSpec.spec);
      return;
    }

    // Start with a deep copy of the BE's own (merged) spec
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- spec merge mutates dynamic paths/tags
    const aggregated = extJsonParse<any>(extJsonStringify(mergedOpenApiSpec()));

    // Fetch all registered services
    let services: Awaited<ReturnType<ServiceRegistryService["findAll"]>> = [];
    try {
      services = await new ServiceRegistryService().findAll();
    } catch (err) {
      logger.error("Failed to fetch service registry:", { tags: ["openapi"], error: err });
      // Return BE-only spec if registry is unavailable
      aggregated.info = {
        ...aggregated.info,
        title: "Primebrick API (partial — service registry unavailable)",
        description: "Only the backend spec is included. Microservice specs could not be fetched.",
      };
      res.json(aggregated);
      return;
    }

    // Merge each online microservice's spec
    for (const svc of services) {
      if (svc.status !== "online" || !svc.is_enabled) continue;

      try {
        const specUrl = new URL("/api/v1/openapi.json", svc.base_url).toString();
        const svcRef = svc.pkg_name
          ? `${svc.pkg_name}/${svc.service_version ?? "?"}`
          : svc.code;
        const response = await internalFetch(specUrl, {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          let reason: string | undefined;
          try {
            const problem = (await response.json()) as { internal_code?: string };
            reason = problem.internal_code;
          } catch { /* body not json */ }
          logger.error(`OpenAPI spec fetch rejected by ${svcRef}`, { tags: ["openapi", `${response.status}`], ...(reason ? { reason } : {}) });
          continue;
        }

        const svcSpec = await response.json();

        // Inject x-badges and tag into every microservice operation before merging
        for (const path of Object.keys(svcSpec.paths || {})) {
          for (const method of ["get", "post", "put", "delete", "patch"]) {
            if (svcSpec.paths[path][method]) {
              svcSpec.paths[path][method]["x-badges"] = [
                { name: "v1", color: "#38bdf8", position: "after" },
                { name: "Latest", color: "#22c55e", position: "after" },
              ];
              // Tag each operation with the service code for sidebar grouping
              const existingTags = svcSpec.paths[path][method].tags;
              if (!existingTags || !existingTags.includes(svc.code)) {
                svcSpec.paths[path][method].tags = [
                  ...(existingTags || []),
                  svc.code,
                ];
              }
            }
          }
        }

        // Prefix microservice paths with /svc/:serviceCode
        for (const [path, methods] of Object.entries(svcSpec.paths || {})) {
          const proxiedPath = `/svc/${svc.code}${path}`;
          aggregated.paths[proxiedPath] = methods;

          // Add tag for this service
          if (!aggregated.tags) aggregated.tags = [];
          const existingTag = aggregated.tags.find((t: { name: string }) => t.name === svc.code);
          if (!existingTag) {
            aggregated.tags.push({
              name: svc.code,
              description: svc.description || `${svc.name || svc.code} microservice`,
            });
          }
        }
      } catch (err) {
        logger.error(`Failed to fetch spec for ${svc.code}:`, { tags: ["openapi"], error: err });
        // Skip unavailable services — partial spec is valid
      }
    }

    // Update info
    aggregated.info = {
      ...aggregated.info,
      title: "Primebrick Aggregated API",
      description:
        "Combined API spec for the Primebrick backend and all online microservices. Microservice paths are prefixed with /svc/:serviceCode and accessible via the gateway proxy.",
    };

    // Cache the result
    cachedSpec = { spec: aggregated, timestamp: Date.now() };

    res.json(aggregated);
  });

  return router;
}
