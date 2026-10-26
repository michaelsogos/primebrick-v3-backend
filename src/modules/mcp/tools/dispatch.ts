/**
 * Dispatch logic for MCP tool handlers.
 *
 * For `module="be"`: calls the BE service layer directly (in-process).
 * For `module="<microservice>"`: proxies HTTP via the existing `/svc/:serviceCode/...`
 * proxy, forwarding the user's raw access token.
 *
 * The dispatch layer is the bridge between the generic tool handlers and
 * the actual business logic. It ensures:
 *   - BE entities use in-process service calls (no HTTP loopback)
 *   - Microservice entities use HTTP proxy with JWT forwarding
 *   - RBAC is enforced before dispatch (BE entities only — microservices
 *     enforce their own RBAC)
 */

import { isPermissionGranted, internalFetch, extJsonStringify, type Permission } from "@primebrick/sdk";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { authInfoToUser } from "../token-verifier.js";
import { entityRegistry, type Operation } from "./entity-registry.js";
import { getAuthEventsService } from "../../auth/services/auth-events.service.js";
import { OrganizationsService } from "../../auth/services/organizations.service.js";
import { SystemService } from "../../system/system.service.js";
import { organizationMeta } from "../../auth/organizations.meta.js";
import { userProfileMeta } from "../../auth/user-profiles.meta.js";
import { getUserService } from "../../auth/services/user.service.js";

// ─── RBAC ────────────────────────────────────────────────────────────────────

/**
 * Check if the authenticated user has permission for the requested operation.
 * BE entities only — microservices enforce their own RBAC.
 */
export function checkRbac(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  operation: Operation,
): void {
  const user = authInfoToUser(authInfo);
  const entry = entityRegistry.get(module, entity);
  if (!entry) {
    throw new Error(`Entity not found: ${module}/${entity}`);
  }

  // Admin bypass
  if (user.is_admin) return;

  // Microservice entities — RBAC enforced by the microservice itself
  if (entry.handler_type === "proxy") return;

  // BE entities — check permissions
  const requiredPermissions = entry.permissions?.[operation];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    throw new Error(`No permissions defined for ${module}/${entity}/${operation}`);
  }

  const userPerms = new Set(user.permissions);
  const granted = requiredPermissions.some((p) => isPermissionGranted(userPerms, p));
  if (!granted) {
    throw new RbacDeniedError(
      `Permission denied: requires any of [${requiredPermissions.join(", ")}]`,
    );
  }
}

/** Thrown when RBAC check fails. Tool handlers catch this and return a 403-equivalent error. */
export class RbacDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RbacDeniedError";
  }
}

/** Thrown when the (module, entity) combination is not in the registry. */
export class EntityNotFoundError extends Error {
  constructor(module: string, entity: string) {
    super(`Entity not found: ${module}/${entity}. Use list_available_entities to discover valid combinations.`);
    this.name = "EntityNotFoundError";
  }
}

/** Thrown when an operation is not supported for the given entity. */
export class OperationNotSupportedError extends Error {
  constructor(module: string, entity: string, operation: string) {
    super(`Operation '${operation}' is not supported for ${module}/${entity}.`);
    this.name = "OperationNotSupportedError";
  }
}

// ─── BE In-Process Dispatch ──────────────────────────────────────────────────

function getOrganizationService(): OrganizationsService {
  return new OrganizationsService();
}

/**
 * Dispatch a list operation to the BE service layer.
 */
export async function dispatchLocalList(
  entity: string,
  params: {
    search?: string;
    search_in?: string[];
    sort_key?: string;
    sort_dir?: "asc" | "desc";
    page?: number;
    page_size?: number;
    filters?: unknown;
    deleted_records?: "EXCLUDED" | "ONLY" | "INCLUDED";
  },
): Promise<unknown> {
  const query = {
    search: params.search,
    search_in: params.search_in,
    sort_key: params.sort_key ?? null,
    sort_dir: params.sort_dir as "asc" | "desc" | undefined,
    page: params.page ?? 1,
    page_size: params.page_size ?? 25,
    filters: params.filters as never,
    deleted_records: params.deleted_records ?? "EXCLUDED",
  };

  switch (entity) {
    case "organization":
      return getOrganizationService().listOrganizations(query as never);
    case "user_profile":
      return getUserService().listUsers(query as never);
    case "auth_event":
      return getAuthEventsService().list(query as never);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a get operation to the BE service layer.
 */
export async function dispatchLocalGet(entity: string, uuid: string): Promise<unknown> {
  switch (entity) {
    case "organization":
      return getOrganizationService().getOrganization(uuid);
    case "user_profile":
      return getUserService().getUserByUuid(uuid);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a create operation to the BE service layer.
 */
export async function dispatchLocalCreate(
  entity: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  switch (entity) {
    case "organization":
      return getOrganizationService().createOrganization(data as never);
    case "user_profile":
      return (await getUserService().createUser(data as never)).profile;
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch an update operation to the BE service layer.
 */
export async function dispatchLocalUpdate(
  entity: string,
  uuid: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  switch (entity) {
    case "organization":
      await getOrganizationService().updateOrganization(uuid, data as never);
      return { success: true };
    case "user_profile":
      return getUserService().updateUserProfile(uuid, data as never);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a delete operation (soft-delete) to the BE service layer.
 */
export async function dispatchLocalDelete(entity: string, uuid: string, version: number): Promise<unknown> {
  switch (entity) {
    case "organization":
      await getOrganizationService().deleteOrganization(uuid, version);
      return { success: true };
    case "user_profile":
      await getUserService().deleteUser(uuid, version);
      return { success: true };
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a restore operation to the BE service layer.
 */
export async function dispatchLocalRestore(entity: string, uuid: string, version: number): Promise<unknown> {
  switch (entity) {
    case "organization":
      await getOrganizationService().restoreOrganization(uuid, version);
      return { success: true };
    case "user_profile":
      await getUserService().restoreUser(uuid, version);
      return { success: true };
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch an audit operation to the BE service layer.
 */
export async function dispatchLocalAudit(
  entity: string,
  uuid: string,
  page: number,
  limit: number,
): Promise<unknown> {
  switch (entity) {
    case "organization":
      return getOrganizationService().getOrganizationAudit(uuid, page, limit);
    case "user_profile":
      return getUserService().getUserProfileAudit(uuid, page, limit);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a meta operation to the BE entity metadata.
 */
export async function dispatchLocalMeta(entity: string): Promise<unknown> {
  switch (entity) {
    case "organization":
      return organizationMeta;
    case "user_profile":
      return userProfileMeta;
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a bulk action to the BE service layer.
 */
export async function dispatchLocalBulk(
  entity: string,
  action: "delete" | "restore",
  items: Array<{ uuid: string; version: number }>,
): Promise<unknown> {
  const results: Array<{ uuid: string; success: boolean; error?: string }> = [];
  for (const { uuid, version } of items) {
    try {
      if (action === "delete") {
        await dispatchLocalDelete(entity, uuid, version);
      } else {
        await dispatchLocalRestore(entity, uuid, version);
      }
      results.push({ uuid, success: true });
    } catch (err) {
      results.push({
        uuid,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { results };
}

// ─── Microservice Proxy Dispatch ─────────────────────────────────────────────

/**
 * Build the proxy path for a microservice entity operation.
 * Uses the standardized entity CRUD path pattern.
 */
function buildProxyPath(module: string, entity: string, operation: Operation, uuid?: string): string {
  switch (operation) {
    case "list":
      return `/svc/${module}/api/v1/entities/${entity}/list`;
    case "get":
      return `/svc/${module}/api/v1/entities/${entity}/${uuid}`;
    case "create":
      return `/svc/${module}/api/v1/entities/${entity}`;
    case "update":
      return `/svc/${module}/api/v1/entities/${entity}/${uuid}`;
    case "delete":
      return `/svc/${module}/api/v1/entities/${entity}/${uuid}`;
    case "restore":
      return `/svc/${module}/api/v1/entities/${entity}/${uuid}/restore`;
    case "audit":
      return `/svc/${module}/api/v1/entities/${entity}/${uuid}/audit`;
    case "meta":
      return `/svc/${module}/api/v1/entities/${entity}/meta`;
    case "aggregate":
      return `/svc/${module}/api/v1/entities/${entity}/aggregate`;
  }
}

/**
 * Proxy a request to a microservice via the BE's internal HTTP proxy.
 * We use `fetch` to call the BE's own proxy endpoint — this is simpler than
 * reconstructing the Express proxy logic and ensures the proxy's RBAC and
 * token forwarding are reused.
 */
export async function proxyToMicroservice(
  authInfo: AuthInfo,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<unknown> {
  const user = authInfoToUser(authInfo);
  const token = user.raw_access_token ?? authInfo.token;

  const url = new URL(`http://localhost:${process.env.PORT ?? 3001}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      url.searchParams.set(k, v);
    }
  }

  const response = await internalFetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? extJsonStringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Microservice proxy error ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

/**
 * Dispatch a list operation to a microservice via proxy.
 */
export async function dispatchProxyList(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  params: {
    search?: string;
    search_in?: string[];
    sort_key?: string;
    sort_dir?: "asc" | "desc";
    page?: number;
    page_size?: number;
    filters?: unknown;
    deleted_records?: "EXCLUDED" | "ONLY" | "INCLUDED";
  },
): Promise<unknown> {
  const query: Record<string, string> = {};
  if (params.search) query.search = params.search;
  if (params.search_in) query.search_in = params.search_in.join(",");
  if (params.sort_key) query.sort_key = params.sort_key;
  if (params.sort_dir) query.sort_dir = params.sort_dir;
  if (params.page) query.page = String(params.page);
  if (params.page_size) query.page_size = String(params.page_size);
  if (params.filters) query.filters = extJsonStringify(params.filters);
  if (params.deleted_records) query.deleted_records = params.deleted_records;

  const path = buildProxyPath(module, entity, "list");
  return proxyToMicroservice(authInfo, "GET", path, undefined, query);
}

/**
 * Dispatch a get operation to a microservice via proxy.
 */
export async function dispatchProxyGet(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  uuid: string,
): Promise<unknown> {
  const path = buildProxyPath(module, entity, "get", uuid);
  return proxyToMicroservice(authInfo, "GET", path);
}

/**
 * Dispatch a create operation to a microservice via proxy.
 */
export async function dispatchProxyCreate(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  const path = buildProxyPath(module, entity, "create");
  // `{entity}` write-payload standard: the HTTP envelope is a transport
  // concern — MCP tool callers send flat fields, dispatch wraps them.
  return proxyToMicroservice(authInfo, "POST", path, { entity: data });
}

/**
 * Dispatch an update operation to a microservice via proxy.
 */
export async function dispatchProxyUpdate(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  uuid: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  const path = buildProxyPath(module, entity, "update", uuid);
  return proxyToMicroservice(authInfo, "PUT", path, { entity: data });
}

/**
 * Dispatch a delete operation to a microservice via proxy.
 */
export async function dispatchProxyDelete(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  uuid: string,
  version: number,
): Promise<unknown> {
  const path = `${buildProxyPath(module, entity, "delete", uuid)}?version=${version}`;
  return proxyToMicroservice(authInfo, "DELETE", path);
}

/**
 * Dispatch a restore operation to a microservice via proxy.
 */
export async function dispatchProxyRestore(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  uuid: string,
  version: number,
): Promise<unknown> {
  const path = `${buildProxyPath(module, entity, "restore", uuid)}?version=${version}`;
  return proxyToMicroservice(authInfo, "POST", path);
}

/**
 * Dispatch an audit operation to a microservice via proxy.
 */
export async function dispatchProxyAudit(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  uuid: string,
  page: number,
  limit: number,
): Promise<unknown> {
  const path = buildProxyPath(module, entity, "audit", uuid);
  return proxyToMicroservice(authInfo, "GET", path, undefined, {
    page: String(page),
    limit: String(limit),
  });
}

/**
 * Dispatch a meta operation to a microservice via proxy.
 */
export async function dispatchProxyMeta(
  authInfo: AuthInfo,
  module: string,
  entity: string,
): Promise<unknown> {
  const path = buildProxyPath(module, entity, "meta");
  return proxyToMicroservice(authInfo, "GET", path);
}

// ─── Aggregate ────────────────────────────────────────────────────────────────

/**
 * Aggregate spec passed to dispatchLocalAggregate / dispatchProxyAggregate.
 * Computes COUNT/SUM/AVG/MIN/MAX with optional GROUP BY.
 */
export interface AggregateSpec {
  type: "count" | "sum" | "avg" | "min" | "max";
  /** Field to aggregate (required for sum/avg/min/max; ignored for count). */
  field?: string;
  /** GROUP BY fields. If empty, a single aggregate row is returned. */
  group_by?: string[];
}

/**
 * Dispatch an aggregate operation to the BE service layer.
 *
 * For `auth_events` (the only BE entity supporting aggregate in v1) the
 * query lives in `AuthEventsService` — the dispatcher only routes, it
 * never touches the Dal. Other entities could be added here in the future.
 *
 * Returns: { results: [{ group: {...}, value: bigint }], total: bigint }
 */
export async function dispatchLocalAggregate(
  entity: string,
  params: {
    aggregate: AggregateSpec;
    filters?: Record<string, unknown>;
    sort_key?: string;
    sort_dir?: "asc" | "desc";
    page?: number;
    page_size?: number;
  },
): Promise<unknown> {
  switch (entity) {
    case "auth_event":
      return getAuthEventsService().aggregateEvents(params);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch an aggregate operation to a microservice via proxy.
 * Microservices implement their own aggregate endpoint at the standard path.
 */
export async function dispatchProxyAggregate(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  params: {
    aggregate: AggregateSpec;
    filters?: Record<string, unknown>;
    sort_key?: string;
    sort_dir?: "asc" | "desc";
    page?: number;
    page_size?: number;
  },
): Promise<unknown> {
  const path = buildProxyPath(module, entity, "aggregate");
  return proxyToMicroservice(authInfo, "POST", path, params);
}

// ─── Service Registry (manage_service tool) ──────────────────────────────────

/**
 * List all services from the service registry.
 */
export async function listServices(): Promise<unknown> {
  return new SystemService().listServices();
}

/**
 * Get a single service by code.
 */
export async function getService(code: string): Promise<unknown> {
  return new SystemService().getService(code);
}

/**
 * Toggle a service's is_enabled flag.
 */
export async function activateService(code: string): Promise<unknown> {
  return new SystemService().toggleService(code);
}

/**
 * Update a service's config fields.
 */
export async function updateService(
  code: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  return new SystemService().updateService(code, {
    name: data.name as string | undefined,
    description: data.description as string | undefined,
    base_url: data.base_url as string | undefined,
    icon: data.icon as string | undefined,
    icon_type: data.icon_type as string | undefined,
    author: data.author as string | undefined,
    github_repo_url: data.github_repo_url as string | undefined,
  });
}

/**
 * Soft-delete a service from the registry — the arch default for removal:
 * the row becomes a tombstone (excluded from /modules, NATS routing and
 * schema-ownership checks) and a later service.register restores it.
 * Physical purge happens only through explicit admin `hardDelete*`.
 */
export async function deleteService(code: string): Promise<unknown> {
  return new SystemService().deleteService(code);
}
