/**
 * OAuth Metadata — RFC 9728 Protected Resource Metadata + RFC 8414 Authorization Server Metadata.
 *
 * Serves both discovery documents as Express routes:
 *   - GET /.well-known/oauth-protected-resource/mcp — RFC 9728 PRM
 *   - GET /.well-known/oauth-authorization-server — RFC 8414 AS metadata
 *
 * The metadata is built lazily on each request using the current auth config.
 * This allows the routes to be mounted synchronously at startup (before the
 * errorHandler middleware) while still having access to the auth config.
 */

import { Router, type Request, type Response } from "express";
import cors from "cors";
import { buildOAuthProtectedResourceMetadata } from "@modelcontextprotocol/server";
import { getAuthConfig, type AuthConfig } from "@primebrick/sdk";

/**
 * Determine the public base URL of the BE.
 * In production this comes from the `PUBLIC_BASE_URL` env var.
 * In dev, we derive it from the request host or default to localhost:3001.
 */
export function getPublicBaseUrl(req?: { protocol: string; get: (name: string) => string | undefined }): string {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  if (req) {
    const forwardedProto = req.get("x-forwarded-proto");
    const forwardedHost = req.get("x-forwarded-host");
    const host = forwardedHost ?? req.get("host");
    if (host) {
      const proto = forwardedProto ?? req.protocol;
      return `${proto}://${host}`;
    }
  }

  const port = process.env.PORT ?? "3001";
  return `http://localhost:${port}`;
}

/**
 * Build the RFC 8414 Authorization Server Metadata document.
 * Points to the BE's own OAuth endpoints (authorize, token, register).
 */
export async function buildAuthorizationServerMetadata(baseUrl: string, cfg: AuthConfig): Promise<Record<string, unknown>> {
  const issuer = baseUrl;

  return {
    issuer,
    authorization_endpoint: `${baseUrl}/mcp/oauth/authorize`,
    token_endpoint: `${baseUrl}/mcp/oauth/token`,
    registration_endpoint: `${baseUrl}/mcp/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["mcp:tools", "openid", "profile", "email"],
    revocation_endpoint: cfg.idp_endpoint
      ? `${cfg.idp_endpoint}/api/login/oauth/revoke`
      : undefined,
    service_documentation: `${baseUrl}/api/v1/openapi.json`,
  };
}

/**
 * Build the RFC 9728 Protected Resource Metadata document.
 */
function buildProtectedResourceMetadata(
  oauthMetadata: Record<string, unknown>,
  resourceServerUrl: URL,
): Record<string, unknown> {
  return buildOAuthProtectedResourceMetadata({
    oauthMetadata: oauthMetadata as never,
    resourceServerUrl,
    scopesSupported: ["mcp:tools", "openid", "profile", "email"],
    resourceName: "Primebrick MCP Server",
    dangerouslyAllowInsecureIssuerUrl:
      resourceServerUrl.protocol === "http:" &&
      (resourceServerUrl.hostname === "localhost" || resourceServerUrl.hostname === "127.0.0.1"),
  });
}

/**
 * Build the OAuth metadata router (synchronous — metadata built lazily per request).
 *
 * Serves:
 *   - GET /.well-known/oauth-protected-resource/mcp — RFC 9728 PRM
 *   - GET /.well-known/oauth-authorization-server — RFC 8414 AS metadata
 */
export function oauthMetadataRouter(): Router {
  const router = Router();

  // Permissive CORS for discovery endpoints
  router.use(cors());

  // GET /.well-known/oauth-authorization-server — RFC 8414 AS metadata
  router.get("/.well-known/oauth-authorization-server", async (req: Request, res: Response) => {
    try {
      const baseUrl = getPublicBaseUrl(req);
      const cfg = await getAuthConfig();
      const metadata = await buildAuthorizationServerMetadata(baseUrl, cfg);
      res.status(200).json(metadata);
    } catch (err) {
      console.error("[MCP OAuth Metadata] AS metadata error:", err);
      res.status(500).json({
        error: "server_error",
        error_description: err instanceof Error ? err.message : "Failed to build AS metadata",
      });
    }
  });

  // GET /.well-known/oauth-protected-resource/mcp — RFC 9728 PRM
  router.get("/.well-known/oauth-protected-resource/mcp", async (req: Request, res: Response) => {
    try {
      const baseUrl = getPublicBaseUrl(req);
      const cfg = await getAuthConfig();
      const oauthMetadata = await buildAuthorizationServerMetadata(baseUrl, cfg);
      const resourceServerUrl = new URL(`${baseUrl}/mcp`);
      const prm = buildProtectedResourceMetadata(oauthMetadata, resourceServerUrl);
      res.status(200).json(prm);
    } catch (err) {
      console.error("[MCP OAuth Metadata] PRM error:", err);
      res.status(500).json({
        error: "server_error",
        error_description: err instanceof Error ? err.message : "Failed to build PRM",
      });
    }
  });

  return router;
}
