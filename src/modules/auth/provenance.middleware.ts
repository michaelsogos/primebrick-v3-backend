/**
 * Internal provenance middleware (express) — the BE-edge counterpart of the
 * SDK's createHttpServer enforcement. The BE serves public browser traffic on
 * the same process, so enforcement here is PER-ROUTE: mount it on endpoints
 * that exist for service-to-service traffic only (e.g. the docs-pack pull).
 *
 * A valid proof-of-possession signature is required; the unsealed identity
 * headers are merged back into req.headers by the SDK edge helper after any
 * cleartext injection attempt is stripped.
 */

import type { RequestHandler } from "express";
import { verifyEdgeRequest, AuthError } from "@primebrick/sdk";
import { logger } from "@primebrick/sdk";

export function requireInternalProvenance(): RequestHandler {
  return async (req, res, next): Promise<void> => {
    try {
      const url = new URL(req.originalUrl, "http://internal");
      await verifyEdgeRequest(req, url);
      next();
    } catch (err) {
      const code = err instanceof AuthError ? err.internal_code : "AUTH_SIGNATURE_INVALID";
      logger.warn(`internal provenance rejected on ${req.originalUrl} — ${code}`, { tags: ["auth", "provenance"] });
      res.status(401).json({
        type: `https://primebrick.io/errors/${code}`,
        title: "Unauthorized",
        status: 401,
        detail: "Internal request signature verification failed",
        instance: req.originalUrl,
        internal_code: code,
        severity: "HIGH",
      });
    }
  };
}
