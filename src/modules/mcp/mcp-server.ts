/**
 * MCP Server setup — creates the McpServer instance and registers all tools.
 *
 * The server is created fresh for each HTTP request (stateless mode) by the
 * factory function passed to `createMcpHandler`. This ensures clean state
 * per request and proper authInfo propagation.
 */

import { McpServer } from "@modelcontextprotocol/server";
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

  const entityLines = modules
    .map(
      (m) =>
        `    ${m.module}: ${m.entities.map((e) => e.entity).join(", ")}`,
    )
    .join("\n");

  console.log(
    [
      "[MCP] Server initialized — 11 tools available:",
      ...MCP_TOOL_NAMES.map((name) => `    - ${name}`),
      `[MCP] Registered entities (${entityCount} across ${modules.length} module(s)):`,
      entityLines,
      "[MCP] Endpoint: POST /mcp (Streamable HTTP, stateless mode)",
      "[MCP] Auth: Bearer token (Casdoor JWT via requireBearerAuth)",
    ].join("\n"),
  );
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
