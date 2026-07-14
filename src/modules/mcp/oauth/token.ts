/**
 * Token Endpoint — `POST /mcp/oauth/token`.
 *
 * Exchanges an authorization code (or refresh token) for a Casdoor JWT.
 *
 * The BE acts as a proxy to Casdoor's token endpoint. The resulting access token
 * is a Casdoor JWT that is valid for the BE API — preserving RBAC and permissions.
 *
 * Flow:
 * 1. AI client receives an auth code via the authorize callback.
 * 2. AI client POSTs to /mcp/oauth/token with grant_type=authorization_code,
 *    code, redirect_uri, client_id, client_secret (and code_verifier if PKCE).
 * 3. BE validates the client_id/secret against the DCR registry.
 * 4. BE exchanges the code with Casdoor's token endpoint (using the BE's OIDC
 *    client credentials, since the code was issued to the BE's client_id).
 * 5. BE returns the Casdoor JWT (access_token + refresh_token) to the AI client.
 *
 * For refresh_token grant, the BE forwards the refresh_token to Casdoor.
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import express from "express";
import { getAuthConfig } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { OAuthClientRegistryDal } from "./client-registry.js";

/** RFC 6749 §4.1.3 — Token Request parameters. */
interface TokenRequest {
  grant_type: string;
  code?: string;
  redirect_uri?: string;
  client_id?: string;
  client_secret?: string;
  code_verifier?: string;
  refresh_token?: string;
  scope?: string;
}

/** Send a JSON response bypassing extJsonMiddleware (which forces bigint serialization). */
function sendJson(res: Response, status: number, data: unknown): void {
  res.status(status).set("Content-Type", "application/json").send(JSON.stringify(data));
}

/**
 * Build the token router.
 * Handles POST /mcp/oauth/token.
 */
export function tokenRouter(): Router {
  const router = Router();

  // Token endpoint accepts both JSON and URL-encoded bodies (RFC 6749 requires
  // form-urlencoded, but some clients send JSON).
  router.use(express.urlencoded({ extended: true }));

  // POST /mcp/oauth/token — Exchange code for token
  router.post("/token", async (req: Request, res: Response) => {
    try {
      const params = req.body as TokenRequest;

      // Validate grant_type
      if (!params.grant_type) {
        return sendJson(res, 400, {
          error: "invalid_request",
          error_description: "grant_type is required",
        });
      }

      // Validate client credentials
      const clientId = params.client_id;
      const clientSecret = params.client_secret;

      if (!clientId) {
        return sendJson(res, 400, {
          error: "invalid_client",
          error_description: "client_id is required",
        });
      }

      const dal = new OAuthClientRegistryDal(getPool());
      const client = await dal.findByClientId(clientId);
      if (!client) {
        return sendJson(res, 401, {
          error: "invalid_client",
          error_description: "Unknown client_id",
        });
      }

      // Verify client_secret (if the client uses client_secret_post auth method)
      if (client.token_endpoint_auth_method === "client_secret_post") {
        if (!client.client_secret || client.client_secret !== clientSecret) {
          return sendJson(res, 401, {
            error: "invalid_client",
            error_description: "Invalid client_secret",
          });
        }
      }

      const cfg = await getAuthConfig();
      if (!cfg.casdoor_endpoint) {
        return sendJson(res, 500, {
          error: "server_error",
          error_description: "Casdoor endpoint not configured",
        });
      }

      const casdoorClientId = cfg.oidc.client_id;
      const casdoorClientSecret = cfg.oidc.client_secret;
      if (!casdoorClientId || !casdoorClientSecret) {
        return sendJson(res, 500, {
          error: "server_error",
          error_description: "OIDC client credentials not configured",
        });
      }

      // Proxy to Casdoor's token endpoint
      const casdoorTokenUrl = `${cfg.casdoor_endpoint}/api/login/oauth/access_token`;
      const formData = new URLSearchParams();

      if (params.grant_type === "authorization_code") {
        if (!params.code) {
          return sendJson(res, 400, {
            error: "invalid_request",
            error_description: "code is required for authorization_code grant",
          });
        }

        formData.append("grant_type", "authorization_code");
        formData.append("client_id", casdoorClientId);
        formData.append("client_secret", casdoorClientSecret);
        formData.append("code", params.code);

        // The redirect_uri must match the one used in the authorize request
        // (the BE's callback URL)
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        formData.append("redirect_uri", `${baseUrl}/mcp/oauth/callback`);

        if (params.code_verifier) {
          formData.append("code_verifier", params.code_verifier);
        }
      } else if (params.grant_type === "refresh_token") {
        if (!params.refresh_token) {
          return sendJson(res, 400, {
            error: "invalid_request",
            error_description: "refresh_token is required for refresh_token grant",
          });
        }

        formData.append("grant_type", "refresh_token");
        formData.append("client_id", casdoorClientId);
        formData.append("client_secret", casdoorClientSecret);
        formData.append("refresh_token", params.refresh_token);
        formData.append("scope", params.scope ?? "openid profile email");
      } else {
        return sendJson(res, 400, {
          error: "unsupported_grant_type",
          error_description: `Grant type '${params.grant_type}' is not supported`,
        });
      }

      // Call Casdoor's token endpoint
      const casdoorResponse = await fetch(casdoorTokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const casdoorData = await casdoorResponse.json() as Record<string, unknown>;

      if (!casdoorResponse.ok) {
        // Forward the error from Casdoor
        return sendJson(res, casdoorResponse.status, {
          error: casdoorData.error ?? "server_error",
          error_description: casdoorData.error_description ?? casdoorData.message ?? "Token exchange failed",
        });
      }

      // Return the Casdoor JWT to the AI client.
      // The access_token is a Casdoor JWT valid for the BE API.
      sendJson(res, 200, {
        access_token: casdoorData.access_token,
        token_type: casdoorData.token_type ?? "Bearer",
        expires_in: casdoorData.expires_in ?? 3600,
        refresh_token: casdoorData.refresh_token,
        scope: params.scope ?? client.scope,
      });
    } catch (err) {
      console.error("[MCP OAuth Token] Error:", err);
      sendJson(res, 500, {
        error: "server_error",
        error_description: err instanceof Error ? err.message : "Token exchange failed",
      });
    }
  });

  // Router-level error handler
  router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[MCP OAuth Token] Unhandled error:", err);
    sendJson(res, 500, { error: "server_error", error_description: err.message });
  });

  return router;
}
