/**
 * Entity registry — in-memory map of (module, entity) → handler metadata.
 *
 * BE entities are registered statically at startup (in-process dispatch).
 * Microservice entities are registered dynamically when a microservice
 * registers via NATS (proxy dispatch — paths constructed from the standard
 * template, no per-entity path storage needed).
 *
 * The registry is the single source of truth for:
 *   - Which (module, entity) combinations are valid for MCP tools
 *   - Which CRUD operations each entity supports
 *   - Which permissions are required for each operation (BE entities only)
 *   - How to dispatch: in-process (BE) vs proxy (microservice)
 */

import { Permission } from "@primebrick/sdk";

// ─── Types ───────────────────────────────────────────────────────────────────

/** All CRUD operations supported by the generic tool framework. */
export type Operation =
  | "list"
  | "get"
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "audit"
  | "meta"
  | "aggregate";

/** Bulk operations (separate from single-record CRUD). */
export type BulkOperation = "bulk_delete" | "bulk_restore";

/** Handler type: in-process service call (BE) or HTTP proxy (microservice). */
export type HandlerType = "in-process" | "proxy";

/**
 * Static metadata for a BE entity service factory.
 * The factory returns a service instance that reads actor from ALS.
 */
export interface BeEntityConfig {
  /** Entity name (snake_case plural, e.g. "customer", "organization"). */
  entity: string;
  /** Human-readable label for the entity. */
  label: string;
  /** Operations supported by this entity. */
  supported_operations: Operation[];
  /** Bulk operations supported (empty if none). */
  supported_bulk_operations?: BulkOperation[];
  /** Permission required per operation (OR semantics — any of these grants access). */
  permissions: Partial<Record<Operation, Permission[]>>;
}

/**
 * Proxy entity config for microservice entities.
 * Paths are constructed from the standard template — no path storage needed.
 */
export interface ProxyEntityConfig {
  /** Entity name (snake_case plural). */
  entity: string;
  /** Human-readable label (from microservice OpenAPI tags or title). */
  label: string;
  /** Operations supported — determined by which standard paths exist in the microservice OpenAPI. */
  supported_operations: Operation[];
}

/**
 * A fully resolved registry entry.
 */
export interface EntityRegistryEntry {
  module: string;
  entity: string;
  label: string;
  handler_type: HandlerType;
  supported_operations: Operation[];
  supported_bulk_operations: BulkOperation[];
  /** BE only: permission requirements per operation. */
  permissions?: Partial<Record<Operation, Permission[]>>;
}

// ─── Registry ────────────────────────────────────────────────────────────────

class EntityRegistry {
  private entries: Map<string, EntityRegistryEntry> = new Map();

  private key(module: string, entity: string): string {
    return `${module}:${entity}`;
  }

  /** Register a BE entity (in-process dispatch). */
  registerBeEntity(module: string, config: BeEntityConfig): void {
    const entry: EntityRegistryEntry = {
      module,
      entity: config.entity,
      label: config.label,
      handler_type: "in-process",
      supported_operations: config.supported_operations,
      supported_bulk_operations: config.supported_bulk_operations ?? [],
      permissions: config.permissions,
    };
    this.entries.set(this.key(module, config.entity), entry);
  }

  /** Register a microservice entity (proxy dispatch). */
  registerProxyEntity(module: string, config: ProxyEntityConfig): void {
    const entry: EntityRegistryEntry = {
      module,
      entity: config.entity,
      label: config.label,
      handler_type: "proxy",
      supported_operations: config.supported_operations,
      supported_bulk_operations: [],
    };
    this.entries.set(this.key(module, config.entity), entry);
  }

  /** Unregister all entities for a module (used when a microservice goes offline). */
  unregisterModule(module: string): void {
    for (const [k, entry] of this.entries) {
      if (entry.module === module) {
        this.entries.delete(k);
      }
    }
  }

  /** Look up a registry entry by (module, entity). */
  get(module: string, entity: string): EntityRegistryEntry | undefined {
    return this.entries.get(this.key(module, entity));
  }

  /** Check if an operation is supported for a given (module, entity). */
  supportsOperation(module: string, entity: string, op: Operation): boolean {
    const entry = this.get(module, entity);
    if (!entry) return false;
    return entry.supported_operations.includes(op);
  }

  /** List all entries for a module. */
  listByModule(module: string): EntityRegistryEntry[] {
    const result: EntityRegistryEntry[] = [];
    for (const entry of this.entries.values()) {
      if (entry.module === module) result.push(entry);
    }
    return result;
  }

  /** List all modules with their entities. */
  listModules(): Array<{ module: string; entities: EntityRegistryEntry[] }> {
    const moduleMap = new Map<string, EntityRegistryEntry[]>();
    for (const entry of this.entries.values()) {
      const list = moduleMap.get(entry.module) ?? [];
      list.push(entry);
      moduleMap.set(entry.module, list);
    }
    return Array.from(moduleMap.entries()).map(([module, entities]) => ({
      module,
      entities,
    }));
  }

  /** Clear all entries (for testing). */
  clear(): void {
    this.entries.clear();
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const entityRegistry = new EntityRegistry();

// ─── BE Static Registration ──────────────────────────────────────────────────

/**
 * Register all BE entities at startup.
 * Called once from the MCP module initialization.
 */
export function registerBeEntities(): void {
  // Customer
  entityRegistry.registerBeEntity("be", {
    entity: "customer",
    label: "Customer",
    supported_operations: ["list", "get", "create", "update", "delete", "restore", "audit", "meta"],
    supported_bulk_operations: ["bulk_delete", "bulk_restore"],
    permissions: {
      list: [Permission.CUSTOMERS_READ_ALL],
      get: [Permission.CUSTOMERS_READ_SINGLE, Permission.CUSTOMERS_READ_ALL],
      create: [Permission.CUSTOMERS_CREATE_SINGLE],
      update: [Permission.CUSTOMERS_UPDATE_SINGLE],
      delete: [Permission.CUSTOMERS_DELETE_SINGLE],
      restore: [Permission.CUSTOMERS_RESTORE_SINGLE],
      audit: [Permission.CUSTOMERS_READ_AUDIT],
      meta: [Permission.CUSTOMERS_READ_ALL, Permission.CUSTOMERS_READ_SINGLE],
    },
  });

  // Organization
  entityRegistry.registerBeEntity("be", {
    entity: "organization",
    label: "Organization",
    supported_operations: ["list", "get", "create", "update", "delete", "restore", "audit", "meta"],
    permissions: {
      list: [Permission.ORGANIZATIONS_READ_ALL],
      get: [Permission.ORGANIZATIONS_READ_SINGLE, Permission.ORGANIZATIONS_READ_ALL],
      create: [Permission.ORGANIZATIONS_CREATE_SINGLE],
      update: [Permission.ORGANIZATIONS_UPDATE_SINGLE],
      delete: [Permission.ORGANIZATIONS_DELETE_SINGLE],
      restore: [Permission.ORGANIZATIONS_RESTORE_SINGLE],
      audit: [Permission.ORGANIZATIONS_READ_AUDIT],
      meta: [Permission.ORGANIZATIONS_READ_ALL, Permission.ORGANIZATIONS_READ_SINGLE],
    },
  });

  // User profiles
  entityRegistry.registerBeEntity("be", {
    entity: "user_profiles",
    label: "User Profile",
    supported_operations: ["list", "get", "update", "restore", "audit", "meta"],
    permissions: {
      list: [Permission.USERS_READ_ALL],
      get: [Permission.USERS_READ_SINGLE, Permission.USERS_READ_ALL],
      update: [Permission.USERS_UPDATE_SINGLE],
      restore: [Permission.USERS_RESTORE_SINGLE],
      audit: [Permission.USER_PROFILE_READ_AUDIT],
      meta: [Permission.USERS_READ_ALL, Permission.USERS_READ_SINGLE],
    },
  });

  // Auth events (audit log entity — read-only via MCP, no CRUD)
  entityRegistry.registerBeEntity("be", {
    entity: "auth_events",
    label: "Auth Events",
    supported_operations: ["list", "aggregate", "meta"],
    permissions: {
      list: [Permission.AUTH_EVENTS_READ_ALL],
      aggregate: [Permission.AUTH_EVENTS_READ_ALL],
      meta: [Permission.AUTH_EVENTS_READ_ALL],
    },
  });
}
