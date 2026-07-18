/**
 * auth-webauthn.router — thin controller for WebAuthn / passkey endpoints.
 *
 * Endpoints:
 *   POST   /api/v1/auth/webauthn/signin/begin    → start passkey signin (PUBLIC)
 *   POST   /api/v1/auth/webauthn/signin/finish   → complete passkey signin, sets cookies (PUBLIC)
 *   POST   /api/v1/auth/webauthn/signup/begin    → start passkey enrollment (AUTHENTICATED_USER)
 *   POST   /api/v1/auth/webauthn/signup/finish   → complete passkey enrollment (AUTHENTICATED_USER)
 *   GET    /api/v1/auth/webauthn/credentials     → list enrolled passkeys (AUTHENTICATED_USER)
 *   DELETE /api/v1/auth/webauthn/credentials/:id → remove a passkey (AUTHENTICATED_USER)
 *
 * The router contains NO business logic. Cookies are set via the
 * `setAuthCookies` helper (inside the service, on the signin finish path).
 * All errors are thrown as `ApiError` subclasses and converted to RFC 7807
 * by the centralized `errorHandler`.
 *
 * Origin forwarding:
 *   The browser's `Origin` header is forwarded to Casdoor so it computes the
 *   correct WebAuthn `rpId`. Without this, the rpId would be the BE's outbound
 *   host and `navigator.credentials.get()` would fail in the browser.
 */

import type { RequestHandler, Response } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { CasdoorService } from "../services/casdoor.service.js";
import { WebauthnService } from "../services/webauthn.service.js";
import {
  WebauthnSigninBeginSchema,
  WebauthnSigninFinishSchema,
  WebauthnSignupFinishSchema,
} from "../dto.js";
import { UnauthorizedError } from "../../../http/api-errors.js";

function makeService(): WebauthnService {
  const pool = getPool();
  const casdoor = new CasdoorService(pool);
  return new WebauthnService(pool, casdoor);
}

/**
 * Extract the browser origin to forward to Casdoor. Uses the `Origin` header
 * (set by the browser on POST requests), falling back to the `Referer` header,
 * then to the request protocol + host.
 */
function getBrowserOrigin(req: import("express").Request): string {
  const origin = req.headers.origin;
  if (origin) return origin as string;
  const referer = req.headers.referer;
  if (referer) {
    try {
      const u = new URL(referer);
      return `${u.protocol}//${u.host}`;
    } catch {
      // fall through
    }
  }
  return `${req.protocol}://${req.get("host")}`;
}

/** Require an authenticated user and return their raw access token. */
function requireAccessToken(req: import("express").Request): string {
  const token = req.rawAccessToken;
  if (!token) {
    throw new UnauthorizedError("Access token not found in request", {
      internal_code: "USER_NOT_AUTHENTICATED",
    });
  }
  return token;
}

/** Require an authenticated user and return their IDP identity fields. */
function requireIdpIdentity(req: import("express").Request): {
  idp_code: string;
  idp_org: string | undefined;
  idp_username: string | undefined;
} {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError("User not authenticated", {
      internal_code: "USER_NOT_AUTHENTICATED",
    });
  }
  return {
    idp_code: user.idp_code,
    idp_org: user.idp_org ?? undefined,
    idp_username: user.idp_username ?? undefined,
  };
}

const CredentialIdParamSchema = z.object({
  id: z.string().min(1),
});

export function authWebauthnRouter() {
  const router = makeProtectedRouter();
  const service = makeService();

  const signinBegin: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof WebauthnSigninBeginSchema>;
    const origin = getBrowserOrigin(req);
    const result = await service.signinBegin(body.username, origin);
    res.json(result);
  });

  const signinFinish: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof WebauthnSigninFinishSchema>;
    const origin = getBrowserOrigin(req);
    const result = await service.signinFinish(
      body.nonce,
      body.credential,
      origin,
      res as Response,
    );
    res.json(result);
  });

  const signupBegin: RequestHandler = asyncHandler(async (req, res) => {
    const accessToken = requireAccessToken(req);
    const origin = getBrowserOrigin(req);
    const result = await service.signupBegin(accessToken, origin);
    res.json(result);
  });

  const signupFinish: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof WebauthnSignupFinishSchema>;
    const accessToken = requireAccessToken(req);
    const origin = getBrowserOrigin(req);
    const result = await service.signupFinish(
      body.nonce,
      body.credential,
      accessToken,
      origin,
    );
    res.json(result);
  });

  const listCredentials: RequestHandler = asyncHandler(async (req, res) => {
    const { idp_code, idp_org, idp_username } = requireIdpIdentity(req);
    const credentials = await service.listCredentials(
      idp_code,
      idp_org,
      idp_username,
    );
    res.json({ success: true, credentials });
  });

  const syncPasskeys: RequestHandler = asyncHandler(async (req, res) => {
    const { idp_code, idp_org, idp_username } = requireIdpIdentity(req);
    const result = await service.syncPasskeys(idp_code, idp_org, idp_username);
    res.json({ success: true, ...result });
  });

  const deleteCredential: RequestHandler = asyncHandler(async (req, res) => {
    const params = CredentialIdParamSchema.parse(req.params);
    const { idp_code, idp_org, idp_username } = requireIdpIdentity(req);
    const result = await service.deleteCredential(
      params.id,
      idp_code,
      idp_org,
      idp_username,
    );
    res.json(result);
  });

  registerRoutes(router, [
    {
      method: "post",
      path: "/api/v1/auth/webauthn/signin/begin",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(WebauthnSigninBeginSchema)],
      handler: signinBegin,
    },
    {
      method: "post",
      path: "/api/v1/auth/webauthn/signin/finish",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(WebauthnSigninFinishSchema)],
      handler: signinFinish,
    },
    {
      method: "post",
      path: "/api/v1/auth/webauthn/signup/begin",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: signupBegin,
    },
    {
      method: "post",
      path: "/api/v1/auth/webauthn/signup/finish",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateBody(WebauthnSignupFinishSchema)],
      handler: signupFinish,
    },
    {
      method: "get",
      path: "/api/v1/auth/webauthn/credentials",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: listCredentials,
    },
    {
      method: "post",
      path: "/api/v1/auth/webauthn/sync-passkeys",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: syncPasskeys,
    },
    {
      method: "delete",
      path: "/api/v1/auth/webauthn/credentials/:id",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: deleteCredential,
    },
  ]);

  return router;
}
