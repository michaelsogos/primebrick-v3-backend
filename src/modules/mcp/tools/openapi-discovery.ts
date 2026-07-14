/**
 * OpenAPI entity discovery — fetches a microservice's OpenAPI spec and extracts
 * entity names + supported operations from the standardized `/api/v1/entities/:entity/...`
 * path pattern.
 *
 * This is used by the service lifecycle subscriber to dynamically register
 * microservice entities in the MCP entity registry when services come online.
 */

import type { Operation } from "./entity-registry.js";

/** Entity info extracted from a microservice's OpenAPI spec. */
export interface DiscoveredEntity {
  /** Entity name (snake_case plural, e.g. "providers", "config_entries"). */
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
 * Returns an empty array if the spec cannot be fetched or parsed.
 */
export async function discoverEntitiesFromService(baseUrl: string): Promise<DiscoveredEntity[]> {
  const specUrl = `${baseUrl.replace(/\/$/, "")}/api/v1/openapi.json`;
  try {
    const response = await fetch(specUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      console.warn(`[mcp-discovery] Failed to fetch OpenAPI spec from ${specUrl}: ${response.status}`);
      return [];
    }
    const spec = await response.json();
    const entities = discoverEntitiesFromSpec(spec);
    console.log(`[mcp-discovery] Discovered ${entities.length} entities from ${specUrl}: ${entities.map((e) => e.entity).join(", ")}`);
    return entities;
  } catch (err) {
    console.warn(`[mcp-discovery] Error fetching OpenAPI spec from ${specUrl}:`, err instanceof Error ? err.message : String(err));
    return [];
  }
}
