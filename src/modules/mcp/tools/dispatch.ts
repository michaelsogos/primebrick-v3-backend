/**
 * Dispatch logic for MCP tool handlers.
 *
 * For `module="be"`: calls the BE service layer directly (in-process).
 * For `module="<microservice>"`: proxies HTTP via the existing `/ws/:serviceCode/...`
 * proxy, forwarding the user's raw access token.
 *
 * The dispatch layer is the bridge between the generic tool handlers and
 * the actual business logic. It ensures:
 *   - BE entities use in-process service calls (no HTTP loopback)
 *   - Microservice entities use HTTP proxy with JWT forwarding
 *   - RBAC is enforced before dispatch (BE entities only — microservices
 *     enforce their own RBAC)
 */

import { isPermissionGranted, type Permission } from "@primebrick/sdk";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { authInfoToUser } from "../token-verifier.js";
import { entityRegistry, type Operation } from "./entity-registry.js";
import { getPool } from "../../../db/pool.js";
import { CustomersService } from "../../customers/customers.service.js";
import { OrganizationsService } from "../../auth/services/organizations.service.js";
import { UserService } from "../../auth/services/user.service.js";
import { ServiceRegistryRepo } from "../../proxy/service-registry-repo.js";
import { customerMeta } from "../../customers/customers.meta.js";
import { organizationMeta } from "../../auth/organizations.meta.js";
import { userProfileMeta } from "../../auth/user-profiles.meta.js";
import { UserProfilesDal } from "../../auth/user-profiles-dal.js";
import { CasdoorService } from "../../auth/services/casdoor.service.js";

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

function getCustomerService(): CustomersService {
  return new CustomersService();
}

function getOrganizationService(): OrganizationsService {
  return new OrganizationsService();
}

function getUserService(): UserService {
  const pool = getPool();
  const dal = new UserProfilesDal(pool);
  const casdoor = new CasdoorService(pool);
  return new UserService(pool, dal, casdoor);
}

/**
 * Dispatch a list operation to the BE service layer.
 */
export async function dispatchBeList(
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
    case "customer":
      return getCustomerService().listCustomers(query as never);
    case "organization":
      return getOrganizationService().listOrganizations(query as never);
    case "user_profiles":
      return getUserService().listUsers(query as never);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a get operation to the BE service layer.
 */
export async function dispatchBeGet(entity: string, uuid: string): Promise<unknown> {
  switch (entity) {
    case "customer":
      return getCustomerService().getCustomer(uuid);
    case "organization":
      return getOrganizationService().getOrganization(uuid);
    case "user_profiles":
      return getUserService().getUserByUuid(uuid);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a create operation to the BE service layer.
 */
export async function dispatchBeCreate(
  entity: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  switch (entity) {
    case "customer":
      return getCustomerService().createCustomer(data as never);
    case "organization":
      return getOrganizationService().createOrganization(data as never);
    case "user_profiles":
      return (await getUserService().createUser(data as never)).profile;
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch an update operation to the BE service layer.
 */
export async function dispatchBeUpdate(
  entity: string,
  uuid: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  switch (entity) {
    case "customer":
      await getCustomerService().updateCustomer(uuid, data as never);
      return { success: true };
    case "organization":
      await getOrganizationService().updateOrganization(uuid, data as never);
      return { success: true };
    case "user_profiles":
      return getUserService().updateUserProfile(uuid, data as never);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a delete operation (soft-delete) to the BE service layer.
 */
export async function dispatchBeDelete(entity: string, uuid: string): Promise<unknown> {
  switch (entity) {
    case "customer":
      await getCustomerService().deleteCustomer(uuid);
      return { success: true };
    case "organization":
      await getOrganizationService().deleteOrganization(uuid);
      return { success: true };
    case "user_profiles":
      await getUserService().deleteUser(uuid);
      return { success: true };
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a restore operation to the BE service layer.
 */
export async function dispatchBeRestore(entity: string, uuid: string): Promise<unknown> {
  switch (entity) {
    case "customer":
      await getCustomerService().restoreCustomer(uuid);
      return { success: true };
    case "organization":
      await getOrganizationService().restoreOrganization(uuid);
      return { success: true };
    case "user_profiles":
      await getUserService().restoreUser(uuid);
      return { success: true };
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch an audit operation to the BE service layer.
 */
export async function dispatchBeAudit(
  entity: string,
  uuid: string,
  page: number,
  limit: number,
): Promise<unknown> {
  switch (entity) {
    case "customer":
      return getCustomerService().getCustomerAudit(uuid, page, limit);
    case "organization":
      return getOrganizationService().getOrganizationAudit(uuid, page, limit);
    case "user_profiles":
      return getUserService().getUserProfileAudit(uuid, page, limit);
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a meta operation to the BE entity metadata.
 */
export async function dispatchBeMeta(entity: string): Promise<unknown> {
  switch (entity) {
    case "customer":
      return customerMeta;
    case "organization":
      return organizationMeta;
    case "user_profiles":
      return userProfileMeta;
    default:
      throw new EntityNotFoundError("be", entity);
  }
}

/**
 * Dispatch a bulk action to the BE service layer.
 */
export async function dispatchBeBulk(
  entity: string,
  action: "delete" | "restore",
  uuids: string[],
): Promise<unknown> {
  const results: Array<{ uuid: string; success: boolean; error?: string }> = [];
  for (const uuid of uuids) {
    try {
      if (action === "delete") {
        await dispatchBeDelete(entity, uuid);
      } else {
        await dispatchBeRestore(entity, uuid);
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
      return `/ws/${module}/api/v1/entities/${entity}/list`;
    case "get":
      return `/ws/${module}/api/v1/entities/${entity}/${uuid}`;
    case "create":
      return `/ws/${module}/api/v1/entities/${entity}`;
    case "update":
      return `/ws/${module}/api/v1/entities/${entity}/${uuid}`;
    case "delete":
      return `/ws/${module}/api/v1/entities/${entity}/${uuid}`;
    case "restore":
      return `/ws/${module}/api/v1/entities/${entity}/${uuid}/restore`;
    case "audit":
      return `/ws/${module}/api/v1/entities/${entity}/${uuid}/audit`;
    case "meta":
      return `/ws/${module}/api/v1/entities/${entity}/meta`;
  }
}

/**
 * Proxy a request to a microservice via the BE's internal HTTP proxy.
 * We use `fetch` to call the BE's own proxy endpoint — this is simpler than
 * reconstructing the Express proxy logic and ensures the proxy's RBAC and
 * token forwarding are reused.
 */
async function proxyToMicroservice(
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

  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
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
  if (params.filters) query.filters = JSON.stringify(params.filters);
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
  return proxyToMicroservice(authInfo, "POST", path, data);
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
  return proxyToMicroservice(authInfo, "PUT", path, data);
}

/**
 * Dispatch a delete operation to a microservice via proxy.
 */
export async function dispatchProxyDelete(
  authInfo: AuthInfo,
  module: string,
  entity: string,
  uuid: string,
): Promise<unknown> {
  const path = buildProxyPath(module, entity, "delete", uuid);
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
): Promise<unknown> {
  const path = buildProxyPath(module, entity, "restore", uuid);
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

// ─── Service Registry (manage_service tool) ──────────────────────────────────

/**
 * List all services from the service registry.
 */
export async function listServices(): Promise<unknown> {
  const repo = new ServiceRegistryRepo(getPool());
  const services = await repo.findAll();
  return { services };
}

/**
 * Get a single service by code.
 */
export async function getService(code: string): Promise<unknown> {
  const repo = new ServiceRegistryRepo(getPool());
  const service = await repo.findByCode(code);
  if (!service) {
    throw new Error(`Service '${code}' not found`);
  }
  return { service };
}

/**
 * Toggle a service's is_enabled flag.
 */
export async function activateService(code: string): Promise<unknown> {
  const repo = new ServiceRegistryRepo(getPool());
  const existing = await repo.findByCode(code);
  if (!existing) {
    throw new Error(`Service '${code}' not found`);
  }
  const newEnabled = !existing.is_enabled;
  await repo.toggleEnabled(code, newEnabled);
  return { code, is_enabled: newEnabled };
}

/**
 * Update a service's config fields.
 */
export async function updateService(
  code: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  const repo = new ServiceRegistryRepo(getPool());
  const existing = await repo.findByCode(code);
  if (!existing) {
    throw new Error(`Service '${code}' not found`);
  }
  await repo.updateByCodeAdmin(code, {
    name: data.name as string | undefined,
    description: data.description as string | undefined,
    base_url: data.base_url as string | undefined,
    icon: data.icon as string | undefined,
    icon_type: data.icon_type as string | undefined,
    author: data.author as string | undefined,
    github_repo_url: data.github_repo_url as string | undefined,
  });
  const updated = await repo.findByCode(code);
  return { service: updated };
}

/**
 * Hard delete a service from the registry.
 * This is a PERMANENT deletion — the record cannot be restored.
 */
export async function deleteService(code: string): Promise<unknown> {
  const repo = new ServiceRegistryRepo(getPool());
  const existing = await repo.findByCode(code);
  if (!existing) {
    throw new Error(`Service '${code}' not found`);
  }
  await repo.hardDeleteByCode(code);
  return { code, deleted: true, permanent: true };
}
