/**
 * OpenAPI entity discovery — fetches a microservice's OpenAPI spec and extracts
 * entity names + supported operations from the standardized `/api/v1/entities/:entity/...`
 * path pattern.
 *
 * This is used by the service lifecycle subscriber to dynamically register
 * microservice entities in the MCP entity registry when services come online.
 */

import { logger, internalFetch } from "@primebrick/sdk";
import type { Operation } from "./entity-registry.js";

/** Entity info extracted from a microservice's OpenAPI spec. */
export interface DiscoveredEntity {
  /** Entity name (snake_case singular, e.g. "provider", "config_entry"). */
  entity: string;
  /** Human-readable label (from OpenAPI tag description or entity name). */
  label: string;
  /** Operations supported by this entity (derived from which paths exist). */
  supported_operations: Operation[];
}

/** Path patterns for the standardized entity CRUD convention. */
const ENTITY_PATH_RE = /^\/api\/v1\/entities\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/;

/** Special sub-paths that map to operations. */
const SUB_PATH_OPERATIONS: Record<string, Operation> = {
  list: "list",
  meta: "meta",
  audit: "audit",
  restore: "restore",
};

/**
 * Parse an OpenAPI spec object and extract discovered entities.
 *
 * The spec must use the standardized `/api/v1/entities/:entity/...` path pattern.
 * Non-entity paths (webhooks, actions, system) are ignored.
 */
export function discoverEntitiesFromSpec(spec: {
  paths?: Record<string, Record<string, unknown>>;
  tags?: Array<{ name: string; description?: string }>;
}): DiscoveredEntity[] {
  const paths = spec.paths ?? {};
  const tagDescriptions = new Map<string, string>();
  for (const tag of spec.tags ?? []) {
    tagDescriptions.set(tag.name, tag.description ?? tag.name);
  }

  // Map: entity → Set<Operation>
  const entityOps = new Map<string, Set<Operation>>();
  // Map: entity → Set<tag> (for label extraction)
  const entityTags = new Map<string, Set<string>>();

  for (const [path, methods] of Object.entries(paths)) {
    const match = path.match(ENTITY_PATH_RE);
    if (!match) continue;

    const entity = match[1];
    const subPath = match[2]; // e.g. "list", "meta", "{uuid}", or undefined (base)
    const subSubPath = match[3]; // e.g. "restore", "audit" (for /{uuid}/restore, /{uuid}/audit)

    let ops = entityOps.get(entity);
    if (!ops) {
      ops = new Set();
      entityOps.set(entity, ops);
    }

    let tags = entityTags.get(entity);
    if (!tags) {
      tags = new Set();
      entityTags.set(entity, tags);
    }

    for (const [method, operation] of Object.entries(methods)) {
      const upperMethod = method.toUpperCase();
      // Collect tags from the operation
      if (operation && typeof operation === "object" && "tags" in operation) {
        const opTags = (operation as { tags?: string[] }).tags;
        if (Array.isArray(opTags)) {
          for (const t of opTags) tags.add(t);
        }
      }

      if (subSubPath) {
        // Third-level sub-path: /{uuid}/restore, /{uuid}/audit
        const op = SUB_PATH_OPERATIONS[subSubPath];
        if (op) {
          if (subSubPath === "restore" && upperMethod !== "POST") continue;
          if (subSubPath === "audit" && upperMethod !== "GET") continue;
          ops.add(op);
        }
      } else if (subPath) {
        // Check if this is a known sub-path (list, meta)
        const op = SUB_PATH_OPERATIONS[subPath];
        if (op) {
          if ((subPath === "list" || subPath === "meta") && upperMethod !== "GET") continue;
          ops.add(op);
        } else if (subPath === "{uuid}" || subPath === ":uuid") {
          // UUID path: /api/v1/entities/:entity/{uuid}
          if (upperMethod === "GET") ops.add("get");
          else if (upperMethod === "PUT") ops.add("update");
          else if (upperMethod === "DELETE") ops.add("delete");
        }
      } else {
        // Base path: /api/v1/entities/:entity
        // POST on base → create
        if (upperMethod === "POST") ops.add("create");
      }
    }
  }

  // Build the result
  const result: DiscoveredEntity[] = [];
  for (const [entity, ops] of entityOps) {
    const tags = entityTags.get(entity);
    // Use the first tag's description as the label, or fall back to the entity name
    let label = entity;
    if (tags && tags.size > 0) {
      const firstTag = Array.from(tags)[0];
      label = tagDescriptions.get(firstTag) ?? firstTag;
    }

    result.push({
      entity,
      label,
      supported_operations: Array.from(ops),
    });
  }

  return result;
}

/**
 * Fetch a microservice's OpenAPI spec from its base_url and discover entities.
 *
 * The spec is expected at `${baseUrl}/api/v1/openapi.json`.
 * `serviceRef` is the target's package identity (`{pkg}/{version}`, e.g.
 * `primebrick-ai/0.6.0`) — used in log messages so they name WHO rejected
 * us, not just the URL.
 * Returns an empty array if the spec cannot be fetched or parsed.
 */
export async function discoverEntitiesFromService(baseUrl: string, serviceRef?: string): Promise<DiscoveredEntity[]> {
  const specUrl = `${baseUrl.replace(/\/$/, "")}/api/v1/openapi.json`;
  const target = serviceRef ?? specUrl;
  // Two attempts: the target's allowlist cache can lag the
  // `client_registry.changed` broadcast by a few ms right after enrollment —
  // a single short retry absorbs the race without masking real rejections.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // Internal BE→US call via the SDK client — service identity (UA +
      // client shield key) is injected automatically; the gate sees a known caller.
      const response = await internalFetch(specUrl, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        // The gate answers RFC7807 — surface the real reason (e.g.
        // UNKNOWN_CLIENT, INVALID_CLIENT_SHIELD_KEY) instead of a bare status.
        let reason = "request rejected";
        try {
          const problem = (await response.json()) as { internal_code?: string; code?: string; title?: string };
          reason = problem.internal_code ?? problem.code ?? problem.title ?? reason;
        } catch { /* body not json */ }
        // 404 = the service does not publish a spec — not an identity
        // rejection; log once at info level and move on.
        if (response.status === 404) {
          logger.info(`No OpenAPI spec found for ${target} — skipping entity discovery`, { tags: ["mcp", "404"] });
          return [];
        }
        const identityRace = response.status === 401 || response.status === 403;
        if (identityRace && attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        logger.warn(`OpenAPI discovery rejected by ${target}`, { tags: ["mcp", `${response.status}`], reason });
        return [];
      }
      const spec = await response.json();
      const pathCount = Object.keys((spec as { paths?: object }).paths ?? {}).length;
      const entities = discoverEntitiesFromSpec(spec);
      logger.done(`Fetched ${pathCount} paths from OpenAPI spec for ${target}`, { tags: ["mcp"] });
      if (entities.length > 0) {
        logger.done(`Discovered ${entities.length} entities for ${target}: ${entities.map((e) => e.entity).join(", ")}`, { tags: ["mcp"] });
      }
      return entities;
    } catch (err) {
      logger.warn(`Error fetching OpenAPI spec from ${target}:`, { tags: ["mcp"], error: err instanceof Error ? err.message : String(err) });
      return [];
    }
  }
  return [];
}
