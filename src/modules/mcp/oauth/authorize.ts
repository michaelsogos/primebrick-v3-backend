/**
 * Authorization Endpoint — `GET /mcp/oauth/authorize`.
 *
 * The BE acts as an Authorization Server proxy to Casdoor.
 *
 * Flow (Phase 3 — with FE consent screen):
 * 1. AI client redirects user to GET /mcp/oauth/authorize?client_id=...&redirect_uri=...&state=...
 * 2. BE validates the client_id against the DCR registry
 * 3. BE redirects to the FE consent screen at /mcp/consent with the original params
 *    + the MCP client name (so the FE can display it)
 * 4. FE consent screen shows the user the requested scopes and client name
 * 5. If user approves → FE redirects back to BE /mcp/oauth/authorize?...&consent_approved=true
 * 6. BE sees consent_approved=true → redirects to Casdoor's authorize endpoint
 * 7. Casdoor redirects back to BE /mcp/oauth/callback with an auth code
 * 8. BE callback forwards the code to the AI client's redirect_uri
 * 9. If user denies → FE redirects directly to the AI client's redirect_uri with error=access_denied
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuthConfig } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { OAuthClientRegistryDal } from "./client-registry.js";

/** Send a JSON response bypassing extJsonMiddleware (which forces bigint serialization). */
function sendJson(res: Response, status: number, data: unknown): void {
  res.status(status).set("Content-Type", "application/json").send(JSON.stringify(data));
}

/** RFC 6749 §4.1.1 — Authorization Request parameters. */
interface AuthorizeParams {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  state?: string;
  scope?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  /** Set by the FE consent screen after user approval. */
  consent_approved?: string;
}

/**
 * Determine the FE base URL.
 * In production, set `PUBLIC_FE_URL` env var (e.g. https://app.primebrick.com).
 * In dev, default to http://localhost:5173 (SvelteKit dev server).
 */
function getFeBaseUrl(req: Request): string {
  if (process.env.PUBLIC_FE_URL) {
    return process.env.PUBLIC_FE_URL.replace(/\/$/, "");
  }
  // Dev default — SvelteKit dev server
  return "http://localhost:5173";
}

/**
 * Build the authorize router.
 * Handles GET /mcp/oauth/authorize and GET /mcp/oauth/callback.
 */
export function authorizeRouter(): Router {
  const router = Router();

  // GET /mcp/oauth/authorize — Start the authorization flow
  router.get("/authorize", async (req: Request, res: Response) => {
    try {
      const params = req.query as unknown as AuthorizeParams;

      // Validate required parameters
      if (!params.client_id) {
        return sendJson(res, 400, {
          error: "invalid_request",
          error_description: "client_id is required",
        });
      }
      if (!params.redirect_uri) {
        return sendJson(res, 400, {
          error: "invalid_request",
          error_description: "redirect_uri is required",
        });
      }
      if (params.response_type !== "code") {
        return sendJson(res, 400, {
          error: "unsupported_response_type",
          error_description: "Only response_type=code is supported",
        });
      }

      // Validate the client_id against the DCR registry
      const dal = new OAuthClientRegistryDal(getPool());
      const client = await dal.findByClientId(params.client_id);
      if (!client) {
        return sendJson(res, 400, {
          error: "invalid_client",
          error_description: "Unknown client_id",
        });
      }

      // Validate the redirect_uri matches a registered URI
      if (!client.redirect_uris.includes(params.redirect_uri)) {
        return sendJson(res, 400, {
          error: "invalid_request",
          error_description: "redirect_uri does not match a registered URI",
        });
      }

      // ─── Phase 3: Consent screen ────────────────────────────────────────
      // If consent_approved is NOT set, redirect to the FE consent screen.
      // The FE will show the consent UI and redirect back with consent_approved=true.
      if (params.consent_approved !== "true") {
        const feBaseUrl = getFeBaseUrl(req);
        const consentParams = new URLSearchParams({
          client_id: params.client_id,
          redirect_uri: params.redirect_uri,
          response_type: params.response_type,
          mcp_client_name: client.client_name ?? params.client_id,
          scope: params.scope ?? "mcp:tools",
        });

        if (params.state) {
          consentParams.set("state", params.state);
        }
        if (params.code_challenge) {
          consentParams.set("code_challenge", params.code_challenge);
          consentParams.set("code_challenge_method", params.code_challenge_method ?? "S256");
        }

        return res.redirect(302, `${feBaseUrl}/mcp/consent?${consentParams.toString()}`);
      }

      // ─── Consent approved → proceed to Casdoor ──────────────────────────
      const cfg = await getAuthConfig();
      if (!cfg.idp_endpoint) {
        return sendJson(res, 500, {
          error: "server_error",
          error_description: "Casdoor endpoint not configured",
        });
      }

      const casdoorClientId = cfg.oidc.client_id;
      if (!casdoorClientId) {
        return sendJson(res, 500, {
          error: "server_error",
          error_description: "OIDC client_id not configured",
        });
      }

      // The Casdoor authorize endpoint
      const casdoorAuthorizeUrl = `${cfg.idp_endpoint}/login/oauth/authorize`;

      // Build the redirect to Casdoor.
      // The redirect_uri is the BE's own callback endpoint, NOT the client's redirect_uri.
      // The BE callback will forward the code to the client's redirect_uri.
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const beCallbackUrl = `${baseUrl}/mcp/oauth/callback`;

      const casdoorParams = new URLSearchParams({
        client_id: casdoorClientId,
        response_type: "code",
        redirect_uri: beCallbackUrl,
        scope: params.scope ?? "openid profile email",
      });

      // Encode the client's state and redirect_uri in the Casdoor state parameter
      // so the callback can forward them to the client.
      const statePayload = JSON.stringify({
        client_state: params.state ?? "",
        client_redirect_uri: params.redirect_uri,
        mcp_client_id: params.client_id,
      });
      casdoorParams.set("state", Buffer.from(statePayload).toString("base64url"));

      if (params.code_challenge) {
        casdoorParams.set("code_challenge", params.code_challenge);
        casdoorParams.set("code_challenge_method", params.code_challenge_method ?? "S256");
      }

      // Redirect to Casdoor's authorize endpoint
      res.redirect(302, `${casdoorAuthorizeUrl}?${casdoorParams.toString()}`);
    } catch (err) {
      console.error("[MCP OAuth Authorize] Error:", err);
      sendJson(res, 500, {
        error: "server_error",
        error_description: err instanceof Error ? err.message : "Authorization failed",
      });
    }
  });

  // GET /mcp/oauth/callback — Casdoor redirects back here after consent
  router.get("/callback", async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string | undefined;
      const stateEncoded = req.query.state as string | undefined;
      const error = req.query.error as string | undefined;

      if (error) {
        // Casdoor returned an error (e.g., user denied consent)
        const errorDescription = req.query.error_description as string | undefined;
        // Forward the error to the client's redirect_uri
        let clientRedirectUri = "";
        if (stateEncoded) {
          try {
            const state = JSON.parse(Buffer.from(stateEncoded, "base64url").toString("utf-8"));
            clientRedirectUri = state.client_redirect_uri ?? "";
          } catch {
            // ignore
          }
        }
        const errorParams = new URLSearchParams({ error, ...(errorDescription ? { error_description: errorDescription } : {}) });
        if (clientRedirectUri) {
          return res.redirect(302, `${clientRedirectUri}?${errorParams.toString()}`);
        }
        return sendJson(res, 400, { error, error_description: errorDescription });
      }

      if (!code || !stateEncoded) {
        return sendJson(res, 400, {
          error: "invalid_request",
          error_description: "Missing code or state parameter from Casdoor callback",
        });
      }

      // Decode the state to get the client's redirect_uri and state
      let state: { client_state?: string; client_redirect_uri?: string; mcp_client_id?: string };
      try {
        state = JSON.parse(Buffer.from(stateEncoded, "base64url").toString("utf-8"));
      } catch {
        return sendJson(res, 400, {
          error: "invalid_request",
          error_description: "Invalid state parameter",
        });
      }

      if (!state.client_redirect_uri) {
        return sendJson(res, 400, {
          error: "invalid_request",
          error_description: "Missing client_redirect_uri in state",
        });
      }

      // Forward the auth code to the client's redirect_uri.
      // The client will exchange the code at our /mcp/oauth/token endpoint.
      const clientParams = new URLSearchParams({
        code,
        ...(state.client_state ? { state: state.client_state } : {}),
      });

      res.redirect(302, `${state.client_redirect_uri}?${clientParams.toString()}`);
    } catch (err) {
      console.error("[MCP OAuth Callback] Error:", err);
      sendJson(res, 500, {
        error: "server_error",
        error_description: err instanceof Error ? err.message : "Callback failed",
      });
    }
  });

  // Router-level error handler
  router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[MCP OAuth Authorize] Unhandled error:", err);
    sendJson(res, 500, { error: "server_error", error_description: err.message });
  });

  return router;
}
