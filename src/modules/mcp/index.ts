/**
 * MCP module entry point — module init only.
 *
 * HTTP mount lives in `src/controllers/http/mcp/index.ts` (controller boundary):
 * that module wires the stateless MCP endpoint and the OAuth 2.1 routers.
 */

import { setAuthPorts } from "./token-verifier.js";
import { logMcpStartupInfo } from "./mcp-server.js";
import type { AuthPorts } from "@primebrick/sdk";

/**
 * Initialize the MCP module with auth ports.
 * Must be called once at startup, after `initAuthPorts()` has run.
 * Logs a summary of registered tools and entities.
 */
export function initMcpModule(ports: AuthPorts): void {
  setAuthPorts(ports);
  logMcpStartupInfo();
}
