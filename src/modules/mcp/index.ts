/**
 * MCP module entry point — exports the MCP router that mounts the /mcp endpoint.
 *
 * Uses the MCP SDK's Express integration:
 *   - `requireBearerAuth` validates the Bearer token via our OAuthTokenVerifier
 *   - `NodeStreamableHTTPServerTransport` handles the Streamable HTTP transport
 *
 * The MCP server is stateless (one transport per request) — no session management.
 * This is the recommended pattern for HTTP-based MCP servers per the SDK docs.
 *
 * OAuth 2.1 endpoints (Phase 2):
 *   - GET  /.well-known/oauth-protected-resource/mcp — RFC 9728 PRM
 *   - GET  /.well-known/oauth-authorization-server — RFC 8414 AS metadata
 *   - POST /mcp/oauth/register — RFC 7591 DCR
 *   - GET  /mcp/oauth/authorize — Authorization endpoint (proxy to Casdoor)
 *   - GET  /mcp/oauth/callback — Casdoor callback
 *   - POST /mcp/oauth/token — Token endpoint (proxy to Casdoor)
 */

import type { Express, RequestHandler } from "express";
import { requireBearerAuth, getOAuthProtectedResourceMetadataUrl } from "@modelcontextprotocol/express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { tokenVerifier, setAuthPorts } from "./token-verifier.js";
import { createMcpServer, logMcpStartupInfo } from "./mcp-server.js";
import { oauthMetadataRouter, getPublicBaseUrl } from "./oauth/metadata.js";
import { dcrRouter } from "./oauth/dynamic-client-registration.js";
import { authorizeRouter } from "./oauth/authorize.js";
import { tokenRouter } from "./oauth/token.js";
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

/**
 * Build the MCP middleware that handles POST /mcp requests.
 * Each request gets a fresh transport + server instance (stateless mode).
 */
function mcpHandler(): RequestHandler {
  return async (req, res) => {
    // Create a fresh transport per request (stateless mode)
    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    // Create a fresh server instance per request
    const server = createMcpServer();

    // Connect the server to the transport
    await server.connect(transport);

    // Handle the request — the transport reads req.auth (set by requireBearerAuth)
    await transport.handleRequest(req, res, req.body);
  };
}

/**
 * Mount the MCP endpoint and OAuth discovery endpoints on an Express app.
 * Synchronous — metadata is built lazily on each request to the well-known endpoints.
 *
 * @param app The Express app to mount on
 * @param path The MCP endpoint path (default: '/mcp')
 */
export function mountMcp(app: Express, path = "/mcp"): void {
  // ─── OAuth 2.1 Discovery Endpoints (RFC 9728 + RFC 8414) ──────────────────
  // Mount the metadata router at the app root (serves /.well-known/* paths)
  app.use(oauthMetadataRouter());

  // ─── OAuth 2.1 Endpoints (DCR, Authorize, Token) ──────────────────────────
  // Mount under /mcp/oauth/*
  app.use("/mcp/oauth", dcrRouter());
  app.use("/mcp/oauth", authorizeRouter());
  app.use("/mcp/oauth", tokenRouter());

  // ─── MCP Endpoint with Bearer Auth ────────────────────────────────────────
  // Build the PRM URL for the 401 challenge so clients can discover the AS.
  const baseUrl = getPublicBaseUrl();
  const resourceServerUrl = new URL(`${baseUrl}${path}`);
  const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(resourceServerUrl);

  const bearerAuth = requireBearerAuth({
    verifier: tokenVerifier,
    requiredScopes: [], // No specific scopes required — RBAC is enforced per-tool
    resourceMetadataUrl,
  });

  // POST /mcp — handle MCP requests (tools/list, tools/call, etc.)
  app.post(path, bearerAuth, mcpHandler());

  // GET /mcp — reject (stateless mode doesn't support SSE streaming)
  app.get(path, (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed. Use POST for MCP requests.",
      },
      id: null,
    });
  });

  // DELETE /mcp — reject (stateless mode doesn't support session termination)
  app.delete(path, (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed. Stateless mode — no session to delete.",
      },
      id: null,
    });
  });
}
