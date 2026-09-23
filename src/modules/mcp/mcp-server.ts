/**
 * MCP Server setup — creates the McpServer instance and registers all tools.
 *
 * The server is created fresh for each HTTP request (stateless mode) by the
 * factory function passed to `createMcpHandler`. This ensures clean state
 * per request and proper authInfo propagation.
 */

import { McpServer } from "@modelcontextprotocol/server";
import { logger } from "@primebrick/sdk";
import { registerGenericTools } from "./tools/generic-tools.js";
import { registerBeEntities, entityRegistry } from "./tools/entity-registry.js";

// Register BE entities once at module load (idempotent — registry is a singleton).
registerBeEntities();

/** The static list of MCP tool names (used for startup logging). */
const MCP_TOOL_NAMES = [
  "list_entities",
  "get_entity",
  "create_entity",
  "update_entity",
  "delete_entity",
  "restore_entity",
  "get_entity_audit",
  "list_available_entities",
  "get_entity_meta",
  "bulk_entity_action",
  "manage_service",
] as const;

/**
 * Log a startup summary of the MCP server: tool count, tool names, and
 * registered entities. Called once during module initialization.
 */
export function logMcpStartupInfo(): void {
  const modules = entityRegistry.listModules();
  const entityCount = modules.reduce((sum, m) => sum + m.entities.length, 0);

  // One logger call per line — the console bridge timestamps each call, so a
  // single multi-line message would leave every line after the first bare.
  logger.info(`[MCP] Server initialized — ${MCP_TOOL_NAMES.length} tools available:`);
  for (const name of MCP_TOOL_NAMES) logger.info(`    - ${name}`);
  logger.info(`[MCP] Registered entities (${entityCount} across ${modules.length} module(s)):`);
  for (const m of modules) {
    logger.info(`    ${m.module}: ${m.entities.map((e) => e.entity).join(", ")}`);
  }
  logger.info("[MCP] Endpoint: POST /mcp (Streamable HTTP, stateless mode)");
  logger.info("[MCP] Auth: Bearer token (Casdoor JWT via requireBearerAuth)");
}

/**
 * Factory function that creates a fresh McpServer instance with all tools registered.
 * Called once per HTTP request by the MCP handler.
 *
 * The authInfo from the request is available to tool handlers via ctx.http.authInfo.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "primebrick-mcp",
    version: "1.0.0",
  });

  registerGenericTools(server);

  return server;
}
