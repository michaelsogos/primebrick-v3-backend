/**
 * Dynamic Client Registration (RFC 7591) — `POST /mcp/oauth/register`.
 *
 * Registers a new OAuth client for the MCP OAuth flow.
 * Clients are stored in the `mcp_oauth_clients` DB table.
 *
 * Request body (RFC 7591 §2):
 *   - redirect_uris: string[] (required)
 *   - client_name: string (optional)
 *   - grant_types: string[] (optional, defaults to ["authorization_code", "refresh_token"])
 *   - response_types: string[] (optional, defaults to ["code"])
 *   - token_endpoint_auth_method: string (optional, defaults to "client_secret_post")
 *   - scope: string (optional, defaults to "mcp:tools")
 *
 * Response (RFC 7591 §3.2):
 *   - client_id: string
 *   - client_secret: string (if token_endpoint_auth_method != "none")
 *   - client_id_issued_at: number (unix timestamp)
 *   - client_secret_expires_at: number (0 = never expires)
 *   - ...all registered metadata echoed back
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { getPool } from "../../../db/pool.js";
import { OAuthClientRegistryDal, type OAuthClient } from "./client-registry.js";

/** Send a JSON response bypassing extJsonMiddleware (which forces bigint serialization). */
function sendJson(res: Response, status: number, data: unknown): void {
  res.status(status).set("Content-Type", "application/json").send(JSON.stringify(data));
}

/** RFC 7591 §2 — Client Metadata (request body). */
interface ClientRegistrationRequest {
  redirect_uris?: string[];
  client_name?: string;
  grant_types?: string[];
  response_types?: string[];
  token_endpoint_auth_method?: string;
  scope?: string;
  client_uri?: string;
  logo_uri?: string;
  policy_uri?: string;
  tos_uri?: string;
}

/** RFC 7591 §3.2 — Client Registration Response. */
interface ClientRegistrationResponse {
  client_id: string;
  client_secret: string | null;
  client_id_issued_at: number;
  client_secret_expires_at: number;
  redirect_uris: string[];
  client_name: string | null;
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
  scope: string;
}

/** Generate a random client secret (64 hex chars = 256 bits). */
function generateClientSecret(): string {
  return randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
}

/** Build the RFC 7591 registration response from the stored client. */
function toRegistrationResponse(client: OAuthClient): ClientRegistrationResponse {
  return {
    client_id: client.client_id,
    client_secret: client.client_secret,
    client_id_issued_at: Math.floor(client.client_id_issued_at.getTime() / 1000),
    client_secret_expires_at: client.client_secret_expires_at
      ? Math.floor(client.client_secret_expires_at.getTime() / 1000)
      : 0, // 0 = never expires per RFC 7591
    redirect_uris: client.redirect_uris,
    client_name: client.client_name,
    grant_types: client.grant_types,
    response_types: client.response_types,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
    scope: client.scope,
  };
}

/**
 * Build the DCR router.
 * Handles POST /mcp/oauth/register and DELETE /mcp/oauth/register/:clientId.
 */
export function dcrRouter(): Router {
  const router = Router();

  // POST /mcp/oauth/register — Register a new client (RFC 7591)
  router.post("/register", async (req: Request, res: Response) => {
    try {
      const body = req.body as ClientRegistrationRequest;

      // Validate required fields
      if (!body.redirect_uris || !Array.isArray(body.redirect_uris) || body.redirect_uris.length === 0) {
        return sendJson(res, 400, {
          error: "invalid_client_metadata",
          error_description: "redirect_uris is required and must be a non-empty array",
        });
      }

      // Validate redirect URIs are valid URLs
      for (const uri of body.redirect_uris) {
        try {
          new URL(uri);
        } catch {
          return sendJson(res, 400, {
            error: "invalid_client_metadata",
            error_description: `Invalid redirect_uri: ${uri}`,
          });
        }
      }

      // Generate client_id and client_secret
      const clientId = `mcp_${randomUUID().replace(/-/g, "")}`;
      const authMethod = body.token_endpoint_auth_method ?? "client_secret_post";
      const clientSecret = authMethod === "none" ? null : generateClientSecret();

      const client: OAuthClient = {
        client_id: clientId,
        client_secret: clientSecret,
        client_name: body.client_name ?? null,
        redirect_uris: body.redirect_uris,
        grant_types: body.grant_types ?? ["authorization_code", "refresh_token"],
        response_types: body.response_types ?? ["code"],
        token_endpoint_auth_method: authMethod,
        scope: body.scope ?? "mcp:tools",
        client_id_issued_at: new Date(),
        client_secret_expires_at: null, // Never expires
      };

      const dal = new OAuthClientRegistryDal(getPool());
      await dal.create(client);

      sendJson(res, 201, toRegistrationResponse(client));
    } catch (err) {
      console.error("[MCP OAuth DCR] Registration error:", err);
      sendJson(res, 500, {
        error: "server_error",
        error_description: err instanceof Error ? err.message : "Registration failed",
      });
    }
  });

  // DELETE /mcp/oauth/register/:clientId — Delete a client (RFC 7591 §3.3)
  router.delete("/register/:clientId", async (req: Request, res: Response) => {
    try {
      const dal = new OAuthClientRegistryDal(getPool());
      const deleted = await dal.deleteByClientId(String(req.params.clientId));
      if (!deleted) {
        return sendJson(res, 404, {
          error: "invalid_client",
          error_description: "Client not found",
        });
      }
      res.status(204).send();
    } catch (err) {
      console.error("[MCP OAuth DCR] Delete error:", err);
      sendJson(res, 500, {
        error: "server_error",
        error_description: err instanceof Error ? err.message : "Delete failed",
      });
    }
  });

  // Router-level error handler — catches any unhandled errors
  router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[MCP OAuth DCR] Unhandled error:", err);
    sendJson(res, 500, { error: "server_error", error_description: err.message });
  });

  return router;
}
