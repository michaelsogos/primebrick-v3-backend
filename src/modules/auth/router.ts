/**
 * Auth router - public endpoints for authentication.
 *
 * Login endpoint acts as a proxy to Casdoor OAuth token endpoint.
 * This keeps the Casdoor client credentials secure on the backend side.
 */

import { Router } from "express";
import { getPool } from "../../db/pool.js";
import { loadAuthConfigFromDb, type AuthConfigDb } from "./config-repo.js";
import { asyncHandler } from "../../http/async-handler.js";
import { z } from "zod";

const LoginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export function authRouter() {
  const router = Router();

  router.post(
    "/api/v1/auth/login",
    asyncHandler(async (req, res) => {
      // Validate request body
      const parseResult = LoginBodySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          type: "/errors/validation-error",
          title: "Validation error",
          status: 400,
          detail: "Request validation failed",
          severity: "MEDIUM",
          issues: parseResult.error.issues.map((i) => ({
            path: i.path.join("."),
            code: i.code,
            message: i.message,
          })),
        });
        return;
      }

      const { username, password } = parseResult.data;

      // Load Casdoor configuration from database or fallback to environment variables
      let casdoorEndpoint = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
      let clientId = process.env.CASDOOR_BUILTIN_CLIENT_ID || "cb05577e2097c31af3c7";
      let clientSecret = process.env.CASDOOR_BUILTIN_CLIENT_SECRET || "47b2e05673a5307ccf0552e32ba45a18f6627f21";
      let orgName = "admin";

      try {
        const pool = getPool();
        const dbConfig = await loadAuthConfigFromDb(pool);
        casdoorEndpoint = dbConfig.casdoorEndpoint || casdoorEndpoint;
        clientId = dbConfig.casdoorBuiltinClientId || clientId;
        clientSecret = dbConfig.casdoorBuiltinClientSecret || clientSecret;
        orgName = dbConfig.casdoorOrganization || orgName;
      } catch (error) {
        console.error("[Auth Login] Could not load configuration from database, using fallback:", error);
      }

      console.log(`[Auth Login] Attempting login for user: ${username}`);
      console.log(`[Auth Login] Casdoor endpoint: ${casdoorEndpoint}`);
      console.log(`[Auth Login] Using clientId: ${clientId}`);

      // Call Casdoor OAuth token endpoint
      const tokenUrl = `${casdoorEndpoint}/api/login/oauth/access_token`;
      const formData = new URLSearchParams();
      formData.append("grant_type", "password");
      formData.append("client_id", clientId);
      formData.append("client_secret", clientSecret);
      formData.append("username", username);
      formData.append("password", password);
      formData.append("scope", "openid profile email");
      formData.append("organization", orgName);

      try {
        const response = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        console.log(`[Auth Login] Casdoor response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Auth Login] Casdoor returned error:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });

          // Parse Casdoor error if available
          let errorDetail = "Authentication failed";
          let errorCode = "AUTH_FAILED";
          try {
            const errorJson = JSON.parse(errorText);
            errorDetail = errorJson.error_description || errorJson.error || errorDetail;
            errorCode = errorJson.error || errorCode;
          } catch {
            // Not JSON, use raw text
            errorDetail = errorText || errorDetail;
          }

          res.status(response.status).json({
            type: "/errors/authentication-failed",
            title: "Authentication failed",
            status: response.status,
            detail: errorDetail,
            internal_code: errorCode,
            severity: "HIGH",
          });
          return;
        }

        const data = await response.json();
        console.log(`[Auth Login] Login successful for user: ${username}`);

        const { access_token, refresh_token, expires_in } = data;

        // Set access_token as httpOnly cookie
        res.cookie("access_token", access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: expires_in * 1000,
          path: "/",
        });

        // Set refresh_token as httpOnly cookie if present
        if (refresh_token) {
          res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/api/v1/auth/refresh",
          });
        }

        // Decode JWT payload on backend to extract user profile data
        const tokenParts = access_token.split('.');
        const encodedPayload = tokenParts[1];
        const rawPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
        const claims = JSON.parse(rawPayload);

        // Return only user profile data to frontend
        res.json({
          success: true,
          user: {
            username: claims.name || claims.username || claims.preferred_username,
            roles: claims.roles || [],
            avatar: claims.avatar,
            email: claims.email,
            organization: claims.organization,
            expiresAt: claims.exp * 1000
          }
        });
      } catch (e) {
        const error = e as Error;
        console.error("[Auth Login] Error calling Casdoor:", {
          error: error.message,
          stack: error.stack,
        });

        res.status(500).json({
          type: "/errors/internal-error",
          title: "Authentication service error",
          status: 500,
          detail: "An error occurred while contacting the authentication service",
          internal_code: "AUTH_SERVICE_ERROR",
          severity: "HIGH",
        });
        return;
      }
    })
  );

  router.post(
    "/api/v1/auth/refresh",
    asyncHandler(async (req, res) => {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        res.status(401).json({
          type: "/errors/authentication-failed",
          title: "Refresh token missing",
          status: 401,
          detail: "No refresh token provided",
          internal_code: "REFRESH_TOKEN_MISSING",
          severity: "HIGH",
        });
        return;
      }

      // Load Casdoor configuration from database or fallback to environment variables
      let casdoorEndpoint = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
      let clientId = process.env.CASDOOR_BUILTIN_CLIENT_ID || "cb05577e2097c31af3c7";
      let clientSecret = process.env.CASDOOR_BUILTIN_CLIENT_SECRET || "47b2e05673a5307ccf0552e32ba45a18f6627f21";
      let orgName = "admin";

      try {
        const pool = getPool();
        const dbConfig = await loadAuthConfigFromDb(pool);
        casdoorEndpoint = dbConfig.casdoorEndpoint || casdoorEndpoint;
        clientId = dbConfig.casdoorBuiltinClientId || clientId;
        clientSecret = dbConfig.casdoorBuiltinClientSecret || clientSecret;
        orgName = dbConfig.casdoorOrganization || orgName;
      } catch (error) {
        console.error("[Auth Refresh] Could not load configuration from database, using fallback:", error);
      }

      console.log(`[Auth Refresh] Attempting token refresh`);
      console.log(`[Auth Refresh] Casdoor endpoint: ${casdoorEndpoint}`);
      console.log(`[Auth Refresh] Using clientId: ${clientId}`);

      // Call Casdoor OAuth token endpoint with refresh_token grant
      const tokenUrl = `${casdoorEndpoint}/api/login/oauth/access_token`;
      const formData = new URLSearchParams();
      formData.append("grant_type", "refresh_token");
      formData.append("client_id", clientId);
      formData.append("client_secret", clientSecret);
      formData.append("refresh_token", refreshToken);
      formData.append("scope", "openid profile email");
      formData.append("organization", orgName);

      try {
        const response = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        console.log(`[Auth Refresh] Casdoor response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Auth Refresh] Casdoor returned error:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });

          // Parse Casdoor error if available
          let errorDetail = "Token refresh failed";
          let errorCode = "REFRESH_FAILED";
          try {
            const errorJson = JSON.parse(errorText);
            errorDetail = errorJson.error_description || errorJson.error || errorDetail;
            errorCode = errorJson.error || errorCode;
          } catch {
            // Not JSON, use raw text
            errorDetail = errorText || errorDetail;
          }

          // Clear invalid refresh token cookie
          res.clearCookie("refresh_token", { path: "/api/v1/auth/refresh" });

          res.status(response.status).json({
            type: "/errors/authentication-failed",
            title: "Token refresh failed",
            status: response.status,
            detail: errorDetail,
            internal_code: errorCode,
            severity: "HIGH",
          });
          return;
        }

        const data = await response.json();
        console.log(`[Auth Refresh] Token refresh successful`);

        const { access_token, refresh_token: newRefreshToken, expires_in } = data;

        // Set new access_token as httpOnly cookie
        res.cookie("access_token", access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: expires_in * 1000,
          path: "/",
        });

        // Update refresh_token if a new one was provided
        if (newRefreshToken) {
          res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/api/v1/auth/refresh",
          });
        }

        // Decode JWT payload on backend to extract user profile data
        const tokenParts = access_token.split('.');
        const encodedPayload = tokenParts[1];
        const rawPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
        const claims = JSON.parse(rawPayload);

        // Return only user profile data to frontend
        res.json({
          success: true,
          user: {
            username: claims.name || claims.username || claims.preferred_username,
            roles: claims.roles || [],
            avatar: claims.avatar,
            email: claims.email,
            organization: claims.organization,
            expiresAt: claims.exp * 1000
          }
        });
      } catch (e) {
        const error = e as Error;
        console.error("[Auth Refresh] Error calling Casdoor:", {
          error: error.message,
          stack: error.stack,
        });

        // Clear refresh token on error
        res.clearCookie("refresh_token", { path: "/api/v1/auth/refresh" });

        res.status(500).json({
          type: "/errors/internal-error",
          title: "Authentication service error",
          status: 500,
          detail: "An error occurred while contacting the authentication service",
          internal_code: "AUTH_SERVICE_ERROR",
          severity: "HIGH",
        });
        return;
      }
    })
  );

  return router;
}
