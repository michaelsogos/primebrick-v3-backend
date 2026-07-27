/**
 * Generic MCP tool definitions — the 11 tools exposed by the Primebrick MCP server.
 *
 * Tools are parameterized by `module` and `entity` so a single tool definition
 * can operate on any registered entity. The LLM picks the right (module, entity)
 * combination based on `list_available_entities` output.
 *
 * Tool list:
 *   1. list_entities          — paginated list with search/filter/sort
 *   2. get_entity             — single record by UUID
 *   3. create_entity          — generic data object, validated per entity
 *   4. update_entity          — update by UUID
 *   5. delete_entity          — soft-delete
 *   6. restore_entity         — restore soft-deleted
 *   7. get_entity_audit       — audit history by UUID
 *   8. list_available_entities — discovery: all modules + entities + status
 *   9. get_entity_meta        — discovery: field schema for create/update
 *  10. bulk_entity_action     — delete/restore array of UUIDs
 *  11. manage_service         — service management (list/get/activate/update/delete)
 */

import { z } from "zod";
import type { McpServer, ServerContext, CallToolResult } from "@modelcontextprotocol/server";
import { extJsonStringify } from "@primebrick/sdk";
import {
  entityRegistry,
  type Operation,
  type BulkOperation,
} from "./entity-registry.js";
import {
  checkRbac,
  RbacDeniedError,
  EntityNotFoundError,
  OperationNotSupportedError,
  dispatchBeList,
  dispatchBeGet,
  dispatchBeCreate,
  dispatchBeUpdate,
  dispatchBeDelete,
  dispatchBeRestore,
  dispatchBeAudit,
  dispatchBeMeta,
  dispatchBeBulk,
  dispatchBeAggregate,
  dispatchProxyList,
  dispatchProxyGet,
  dispatchProxyCreate,
  dispatchProxyUpdate,
  dispatchProxyDelete,
  dispatchProxyRestore,
  dispatchProxyAudit,
  dispatchProxyMeta,
  dispatchProxyAggregate,
  listServices,
  getService,
  activateService,
  updateService,
  deleteService,
} from "./dispatch.js";
import type { AuthInfo } from "@modelcontextprotocol/server";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a standard MCP tool result (text content with JSON payload).
 * Uses extJsonStringify to handle BigInt values from the BE service layer.
 */
function textResult(data: unknown, isError = false): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : extJsonStringify(data),
      },
    ],
    isError,
  };
}

/**
 * Build an error MCP tool result.
 */
function errorResult(message: string): CallToolResult {
  return textResult(message, true);
}

/**
 * Get auth info from the tool handler context.
 */
function getAuthInfo(ctx: ServerContext): AuthInfo {
  const authInfo = ctx.http?.authInfo;
  if (!authInfo) {
    throw new Error("No auth info — token verification may have failed");
  }
  return authInfo;
}

/**
 * Validate that (module, entity) exists and supports the given operation.
 * Throws EntityNotFoundError or OperationNotSupportedError.
 */
function validateEntity(module: string, entity: string, operation: Operation): void {
  const entry = entityRegistry.get(module, entity);
  if (!entry) {
    throw new EntityNotFoundError(module, entity);
  }
  if (!entry.supported_operations.includes(operation)) {
    throw new OperationNotSupportedError(module, entity, operation);
  }
}

/**
 * Wrap a tool handler with standard error handling.
 * Catches known error types and returns appropriate MCP error results.
 */
function withErrorHandling<TArgs>(
  handler: (args: TArgs, ctx: ServerContext) => Promise<CallToolResult>,
): (args: TArgs, ctx: ServerContext) => Promise<CallToolResult> {
  return async (args, ctx) => {
    try {
      return await handler(args, ctx);
    } catch (err) {
      if (err instanceof RbacDeniedError) {
        return errorResult(`Permission denied: ${err.message}`);
      }
      if (err instanceof EntityNotFoundError) {
        return errorResult(err.message);
      }
      if (err instanceof OperationNotSupportedError) {
        return errorResult(err.message);
      }
      const message = err instanceof Error ? err.message : String(err);
      return errorResult(`Tool execution failed: ${message}`);
    }
  };
}

// ─── Tool Schemas ────────────────────────────────────────────────────────────

const moduleEntitySchema = {
  module: z
    .string()
    .describe(
      "Module code: 'be' for backend entities, or a microservice code (e.g. 'emailsender'). Use list_available_entities to discover valid values.",
    ),
  entity: z
    .string()
    .describe(
      "Entity name (snake_case). Use list_available_entities to discover valid values.",
    ),
};

// ─── Tool Registration ───────────────────────────────────────────────────────

/**
 * Register all 11 generic tools on the given McpServer instance.
 */
export function registerGenericTools(server: McpServer): void {
  // 1. list_entities
  server.registerTool(
    "list_entities",
    {
      title: "List Entities",
      description:
        "List records of a given entity type with pagination, search, filtering, and sorting. " +
        "Returns a paginated response with items and metadata. " +
        "Use list_available_entities first to discover valid (module, entity) combinations. " +
        "When `aggregate` is provided, returns aggregated results (COUNT/SUM/AVG/MIN/MAX with optional GROUP BY) instead of row listing.",
      inputSchema: z.object({
        ...moduleEntitySchema,
        search: z
          .string()
          .optional()
          .describe("Full-text search term applied across searchable fields."),
        search_in: z
          .array(z.string())
          .optional()
          .describe("Restrict full-text search to these specific fields."),
        sort_key: z.string().optional().describe("Field name to sort by. For aggregate queries, use 'count' or the aggregate type to sort by the aggregated value."),
        sort_dir: z
          .enum(["asc", "desc"])
          .optional()
          .describe("Sort direction. Defaults to 'desc' for timestamps."),
        page: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Page number (1-based). Defaults to 1."),
        page_size: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Items per page. Defaults to 25. Max 100."),
        filters: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Field-level filters as a JSON object (e.g. {status: 'active'}). For BETWEEN, use {field: {op: 'BETWEEN', value: [start, end]}}."),
        deleted_records: z
          .enum(["EXCLUDED", "ONLY", "INCLUDED"])
          .optional()
          .describe(
            "Filter by deletion status: EXCLUDED (default, only active), ONLY (only soft-deleted), INCLUDED (both).",
          ),
        aggregate: z
          .object({
            type: z
              .enum(["count", "sum", "avg", "min", "max"])
              .describe("Aggregation function."),
            field: z
              .string()
              .optional()
              .describe("Field to aggregate (required for sum/avg/min/max; ignored for count)."),
            group_by: z
              .array(z.string())
              .optional()
              .describe("GROUP BY fields. If omitted, returns a single aggregate row."),
          })
          .optional()
          .describe(
            "Aggregate spec. When provided, the tool returns aggregated results " +
            "({ results: [{ group: {...}, value: number }], total: number }) instead of row listing. " +
            "Example: { type: 'count', group_by: ['user_profile_uuid'] } for 'who logged in most'.",
          ),
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity, aggregate, ...params } = args;

      // If aggregate is provided, dispatch to aggregate path
      if (aggregate) {
        validateEntity(module, entity, "aggregate");
        checkRbac(authInfo, module, entity, "aggregate");

        const entry = entityRegistry.get(module, entity)!;
        let result: unknown;
        if (entry.handler_type === "in-process") {
          result = await dispatchBeAggregate(entity, { aggregate, ...params });
        } else {
          result = await dispatchProxyAggregate(authInfo, module, entity, { aggregate, ...params });
        }
        return textResult(result);
      }

      // Standard list path
      validateEntity(module, entity, "list");
      checkRbac(authInfo, module, entity, "list");

      const entry = entityRegistry.get(module, entity)!;
      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeList(entity, params);
      } else {
        result = await dispatchProxyList(authInfo, module, entity, params);
      }
      return textResult(result);
    }),
  );

  // 2. get_entity
  server.registerTool(
    "get_entity",
    {
      title: "Get Entity",
      description:
        "Retrieve a single entity record by its UUID. " +
        "Returns the full record including all fields.",
      inputSchema: z.object({
        ...moduleEntitySchema,
        uuid: z.string().describe("The UUID of the record to retrieve."),
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity, uuid } = args;
      validateEntity(module, entity, "get");
      checkRbac(authInfo, module, entity, "get");

      const entry = entityRegistry.get(module, entity)!;
      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeGet(entity, uuid);
      } else {
        result = await dispatchProxyGet(authInfo, module, entity, uuid);
      }
      return textResult(result);
    }),
  );

  // 3. create_entity
  server.registerTool(
    "create_entity",
    {
      title: "Create Entity",
      description:
        "Create a new entity record. The data object must match the entity's field schema. " +
        "Use get_entity_meta first to discover the required and optional fields for the target entity.",
      inputSchema: z.object({
        ...moduleEntitySchema,
        data: z
          .record(z.string(), z.unknown())
          .describe(
            "The record data as a JSON object. Field names must match the entity schema (snake_case).",
          ),
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity, data } = args;
      validateEntity(module, entity, "create");
      checkRbac(authInfo, module, entity, "create");

      const entry = entityRegistry.get(module, entity)!;
      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeCreate(entity, data);
      } else {
        result = await dispatchProxyCreate(authInfo, module, entity, data);
      }
      return textResult(result);
    }),
  );

  // 4. update_entity
  server.registerTool(
    "update_entity",
    {
      title: "Update Entity",
      description:
        "Update an existing entity record by UUID. Only the fields provided in the data object will be updated. " +
        "Use get_entity_meta to discover updatable fields.",
      inputSchema: z.object({
        ...moduleEntitySchema,
        uuid: z.string().describe("The UUID of the record to update."),
        data: z
          .record(z.string(), z.unknown())
          .describe("The fields to update as a JSON object (snake_case field names)."),
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity, uuid, data } = args;
      validateEntity(module, entity, "update");
      checkRbac(authInfo, module, entity, "update");

      const entry = entityRegistry.get(module, entity)!;
      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeUpdate(entity, uuid, data);
      } else {
        result = await dispatchProxyUpdate(authInfo, module, entity, uuid, data);
      }
      return textResult(result);
    }),
  );

  // 5. delete_entity
  server.registerTool(
    "delete_entity",
    {
      title: "Delete Entity",
      description:
        "Soft-delete an entity record by UUID. The record is marked as deleted but can be restored with restore_entity. " +
        "Deleted records are excluded from list_entities results by default.",
      inputSchema: z.object({
        ...moduleEntitySchema,
        uuid: z.string().describe("The UUID of the record to soft-delete."),
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity, uuid } = args;
      validateEntity(module, entity, "delete");
      checkRbac(authInfo, module, entity, "delete");

      const entry = entityRegistry.get(module, entity)!;
      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeDelete(entity, uuid);
      } else {
        result = await dispatchProxyDelete(authInfo, module, entity, uuid);
      }
      return textResult(result);
    }),
  );

  // 6. restore_entity
  server.registerTool(
    "restore_entity",
    {
      title: "Restore Entity",
      description:
        "Restore a soft-deleted entity record by UUID. The record becomes active again and appears in list_entities results.",
      inputSchema: z.object({
        ...moduleEntitySchema,
        uuid: z.string().describe("The UUID of the soft-deleted record to restore."),
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity, uuid } = args;
      validateEntity(module, entity, "restore");
      checkRbac(authInfo, module, entity, "restore");

      const entry = entityRegistry.get(module, entity)!;
      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeRestore(entity, uuid);
      } else {
        result = await dispatchProxyRestore(authInfo, module, entity, uuid);
      }
      return textResult(result);
    }),
  );

  // 7. get_entity_audit
  server.registerTool(
    "get_entity_audit",
    {
      title: "Get Entity Audit",
      description:
        "Retrieve the audit history for a specific entity record by UUID. " +
        "Returns a paginated list of audit entries showing who changed what and when.",
      inputSchema: z.object({
        ...moduleEntitySchema,
        uuid: z.string().describe("The UUID of the record to get audit history for."),
        page: z.number().int().positive().optional().describe("Page number (1-based). Defaults to 1."),
        page_size: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Items per page. Defaults to 25."),
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity, uuid, page, page_size } = args;
      validateEntity(module, entity, "audit");
      checkRbac(authInfo, module, entity, "audit");

      const entry = entityRegistry.get(module, entity)!;
      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeAudit(entity, uuid, page ?? 1, page_size ?? 25);
      } else {
        result = await dispatchProxyAudit(authInfo, module, entity, uuid, page ?? 1, page_size ?? 25);
      }
      return textResult(result);
    }),
  );

  // 8. list_available_entities
  server.registerTool(
    "list_available_entities",
    {
      title: "List Available Entities",
      description:
        "Discover all entity types available through the MCP server. " +
        "Returns a list of modules, each with their entities, supported operations, and online/offline status. " +
        "ALWAYS call this first to discover valid (module, entity) combinations before using other tools.",
      inputSchema: z.object({}),
    },
    withErrorHandling(async (_args, _ctx) => {
      const modules = entityRegistry.listModules();
      const result = {
        modules: modules.map((m) => ({
          module: m.module,
          handler_type: m.entities[0]?.handler_type ?? "in-process",
          entities: m.entities.map((e) => ({
            entity: e.entity,
            label: e.label,
            supported_operations: e.supported_operations,
            supported_bulk_operations: e.supported_bulk_operations,
          })),
        })),
      };
      return textResult(result);
    }),
  );

  // 9. get_entity_meta
  server.registerTool(
    "get_entity_meta",
    {
      title: "Get Entity Metadata",
      description:
        "Retrieve the field schema metadata for a given entity type. " +
        "Use this before create_entity or update_entity to discover required fields, " +
        "field types, and which fields are searchable, sortable, or filterable.",
      inputSchema: z.object({
        ...moduleEntitySchema,
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity } = args;
      validateEntity(module, entity, "meta");
      checkRbac(authInfo, module, entity, "meta");

      const entry = entityRegistry.get(module, entity)!;
      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeMeta(entity);
      } else {
        result = await dispatchProxyMeta(authInfo, module, entity);
      }
      return textResult(result);
    }),
  );

  // 10. bulk_entity_action
  server.registerTool(
    "bulk_entity_action",
    {
      title: "Bulk Entity Action",
      description:
        "Perform a bulk action (delete or restore) on multiple entity records by UUID. " +
        "Processes each UUID individually and returns a per-UUID result array. " +
        "Only entities that support bulk operations can be used with this tool.",
      inputSchema: z.object({
        ...moduleEntitySchema,
        action: z
          .enum(["delete", "restore"])
          .describe("The bulk action to perform: 'delete' (soft-delete) or 'restore'."),
        uuids: z
          .array(z.string())
          .min(1)
          .max(100)
          .describe("Array of UUIDs to apply the action to (1-100 items)."),
      }),
    },
    withErrorHandling(async (args, ctx) => {
      const authInfo = getAuthInfo(ctx);
      const { module, entity, action, uuids } = args;

      const entry = entityRegistry.get(module, entity);
      if (!entry) {
        throw new EntityNotFoundError(module, entity);
      }

      const bulkOp: BulkOperation = action === "delete" ? "bulk_delete" : "bulk_restore";
      if (!entry.supported_bulk_operations.includes(bulkOp)) {
        throw new OperationNotSupportedError(module, entity, bulkOp);
      }

      // RBAC: check permission for the underlying single operation
      checkRbac(authInfo, module, entity, action);

      let result: unknown;
      if (entry.handler_type === "in-process") {
        result = await dispatchBeBulk(entity, action, uuids);
      } else {
        // Microservice bulk: loop through proxy calls
        const results: Array<{ uuid: string; success: boolean; error?: string }> = [];
        for (const uuid of uuids) {
          try {
            if (action === "delete") {
              await dispatchProxyDelete(authInfo, module, entity, uuid);
            } else {
              await dispatchProxyRestore(authInfo, module, entity, uuid);
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
        result = { results };
      }
      return textResult(result);
    }),
  );

  // 11. manage_service
  server.registerTool(
    "manage_service",
    {
      title: "Manage Service",
      description:
        "Manage registered microservices in the Primebrick service registry. " +
        "Actions: 'list' (all services), 'get' (single service by code), 'activate' (toggle enabled/disabled), " +
        "'update' (modify service metadata), 'delete' (PERMANENT hard-delete with no restore). " +
        "WARNING: The 'delete' action is irreversible — the service record is permanently removed from the registry.",
      inputSchema: z.object({
        action: z
          .enum(["list", "get", "activate", "update", "delete"])
          .describe("The service management action to perform."),
        code: z
          .string()
          .optional()
          .describe(
            "Service code (required for get/activate/update/delete actions; ignored for list).",
          ),
        data: z
          .record(z.string(), z.unknown())
          .optional()
          .describe(
            "Service metadata fields to update (only for 'update' action): name, description, base_url, icon, icon_type, author, github_repo_url.",
          ),
      }),
    },
    withErrorHandling(async (args, _ctx) => {
      const { action, code, data } = args;

      switch (action) {
        case "list":
          return textResult(await listServices());
        case "get":
          if (!code) throw new Error("'code' is required for 'get' action");
          return textResult(await getService(code));
        case "activate":
          if (!code) throw new Error("'code' is required for 'activate' action");
          return textResult(await activateService(code));
        case "update":
          if (!code) throw new Error("'code' is required for 'update' action");
          if (!data) throw new Error("'data' is required for 'update' action");
          return textResult(await updateService(code, data));
        case "delete":
          if (!code) throw new Error("'code' is required for 'delete' action");
          return textResult(await deleteService(code));
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }),
  );
}
