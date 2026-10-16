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
  logger.done(`MCP Server has been initialized with ${MCP_TOOL_NAMES.length} tools available:`, { tags: ["mcp"] });
  for (const name of MCP_TOOL_NAMES) logger.info(`  # ${name}`, { tags: ["mcp"] });
  logger.info(`Entities registered across ${modules.length} module(s):`, { tags: ["mcp"] });
  for (const m of modules) {
    const ref = m.entities[0]?.source_ref ?? m.module;
    logger.info(`  # ${ref}`, { tags: ["mcp"] });
    for (const e of m.entities) logger.info(`    - ${e.impl ?? e.entity}`, { tags: ["mcp"] });
  }
  logger.done("MCP Server is ready at /mcp endpoint", { tags: ["mcp"] });
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
