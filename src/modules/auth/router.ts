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
import { rbacHandler } from "./rbac.middleware.js";
import { Permission } from "./permissions.js";
import { AuditService } from "../../lib/audit/audit-service.js";

const LoginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export function authRouter() {
  const router = Router();
  let auditService: AuditService | null = null;

  const getAuditService = () => {
    if (auditService) return auditService;
    const pool = getPool();
    auditService = new AuditService(pool);
    return auditService;
  };

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
      let clientId = process.env.OIDC_CLIENT_ID || "";
      let clientSecret = process.env.OIDC_CLIENT_SECRET || "";
      let orgName = "acme"; // Default to snake_case lower case

      try {
        const pool = getPool();
        const dbConfig = await loadAuthConfigFromDb(pool);
        casdoorEndpoint = dbConfig.casdoorEndpoint || casdoorEndpoint;
        clientId = dbConfig.oidcClientId || clientId;
        clientSecret = dbConfig.oidcClientSecret || clientSecret;
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

      // --- [ISPEZIONE DEBBUGING OUTBOUND] ---
      console.log("==================================================");
      console.log(`📡 [OUTBOUND REQUEST] Invio dati a Casdoor: ${tokenUrl}`);
      console.log(`   -> grant_type:   "password"`);
      console.log(`   -> client_id:    "${clientId}"`);
      console.log(`   -> client_secret: "${clientSecret ? '*** PRESENT (Length: ' + clientSecret.length + ') ***' : 'MISSING'}"`);
      console.log(`   -> username:     "${username}"`);
      console.log(`   -> password:     "${password}"`);
      console.log(`   -> organization: "${orgName}"`);
      console.log("==================================================");

      try {
        const response = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        console.log(`📥 [INBOUND RESPONSE] Status: ${response.status} ${response.statusText}`);
        
        // Ispezione degli Header di Casdoor (utile per capire se ci sono problemi di sessione o cookie proxy)
        console.log("   -> Headers:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

        if (!response.ok) {
          const errorText = await response.text();

          // GENERAZIONE VOLONTARIA DI UNO STACK TRACE PER L'ERRORE 400/500
          const fakeError = new Error(`Casdoor rejected the request with status ${response.status}`);

          console.error(`❌ [AUTH CRITICAL FALLBACK] Dettaglio fallimento proxy:`);
          console.error(`   -> Body inviato era coerente? ClientID usato: ${clientId}`);
          console.error(`   -> Risposta grezza Casdoor:`, errorText);
          console.error(`   -> Stack Trace del punto di fallimento del Proxy:\n`, fakeError.stack);
          console.error("==================================================");

          let errorDetail = "Authentication failed";
          let errorCode = "AUTH_FAILED";
          try {
            const errorJson = JSON.parse(errorText);
            errorDetail = errorJson.error_description || errorJson.error || errorDetail;
            errorCode = errorJson.error || errorCode;

            // Check if it's an account locked error (too many failed attempts)
            if (errorJson.error === "invalid_grant" && errorJson.error_description) {
              const desc = errorJson.error_description;
              if (desc.includes("too many times")) {
                const minutesMatch = desc.match(/wait for (\d+) minutes/);
                const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

                errorCode = "account_locked";
                errorDetail = `Account locked due to too many failed attempts. Wait ${minutes} minutes.`;

                console.log(`[Auth Login] Account locked detected. Wait time: ${minutes} minutes`);
              }
            }
          } catch {
            errorDetail = errorText || errorDetail;
          }

          // Transform Casdoor 400 (invalid_grant) to 401 for our API semantics
          // 400 from Casdoor means invalid credentials, which should be 401 in our API
          const httpStatus = response.status === 400 ? 401 : response.status;

          res.status(httpStatus).json({
            type: "/errors/authentication-failed",
            title: "Authentication failed",
            status: httpStatus,
            detail: errorDetail,
            instance: "/api/v1/auth/login",
            internal_code: errorCode,
            severity: "HIGH",
          });
          return;
        }

        const data = await response.json();
        console.log(`✅ [AUTH SUCCESS] Login riuscito per: ${username}`);
        
        // ISPEZIONE DEL TOKEN RICEVUTO PRIMA DI CRITTOGRAFARLO NEI COOKIE
        console.log("📦 [TOKEN INSPECTION] Payload grezzo ricevuto da Casdoor:");
        console.log(`   -> Has Access Token:  ${!!data.access_token}`);
        console.log(`   -> Has Refresh Token: ${!!data.refresh_token}`);
        console.log(`   -> Expires In:        ${data.expires_in}s`);
        console.log(`   -> Refresh Expires:   ${data.refresh_expires_in}s`);
        if (data.access_token) {
          const parts = data.access_token.split('.');
          if (parts[1]) {
            const payloadDecoded = Buffer.from(parts[1], 'base64').toString('utf-8');
            console.log(`   -> Claims dentro il JWT di Casdoor:`, JSON.stringify(JSON.parse(payloadDecoded), null, 2));
          }
        }
        console.log("==================================================");

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
        const roles = (claims.roles || []).filter((role: any) => role.isEnabled !== false).map((role: any) => ({
          name: role.name,
          displayName: role.displayName,
          owner: role.owner
        }));

        // Check if user has any roles
        if (!roles || roles.length === 0) {
          res.status(403).json({
            type: "/errors/forbidden",
            title: "User doesn't have permission",
            status: 403,
            detail: "User doesn't have permission",
            internal_code: "user_no_permission",
            severity: "HIGH"
          });
          return;
        }

        res.json({
          success: true,
          user: {
            username: claims.name || claims.username || claims.preferred_username,
            displayName: claims.displayName || claims.name || claims.username || claims.preferred_username,
            email: claims.email,
            organization: claims.organization,
            expiresAt: claims.exp * 1000,
            roles
          }
        });
      } catch (e) {
        const error = e as Error;
        console.error("💥 [AUTH EXCEPTION] Eccezione di rete o parsing durante la chiamata a Casdoor:", {
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
      let clientId = process.env.OIDC_CLIENT_ID || "";
      let clientSecret = process.env.OIDC_CLIENT_SECRET || "";
      let orgName = "acme"; // Default to snake_case lower case

      try {
        const pool = getPool();
        const dbConfig = await loadAuthConfigFromDb(pool);
        casdoorEndpoint = dbConfig.casdoorEndpoint || casdoorEndpoint;
        clientId = dbConfig.oidcClientId || clientId;
        clientSecret = dbConfig.oidcClientSecret || clientSecret;
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

          // Transform Casdoor 400 (invalid_grant) to 401 for our API semantics
          const httpStatus = response.status === 400 ? 401 : response.status;

          res.status(httpStatus).json({
            type: "/errors/authentication-failed",
            title: "Token refresh failed",
            status: httpStatus,
            detail: errorDetail,
            instance: "/api/v1/auth/refresh",
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
        const roles = (claims.roles || []).filter((role: any) => role.isEnabled !== false).map((role: any) => ({
          name: role.name,
          displayName: role.displayName,
          owner: role.owner
        }));

        res.json({
          success: true,
          user: {
            username: claims.name || claims.username || claims.preferred_username,
            displayName: claims.displayName || claims.name || claims.username || claims.preferred_username,
            email: claims.email,
            organization: claims.organization,
            expiresAt: claims.exp * 1000,
            roles
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

  // PATCH /api/v1/auth/me - Update user profile
  const ProfileUpdateSchema = z.object({
    displayName: z.string().optional(),
    email: z.string().email().optional(),
    popoverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  });

  router.patch(
    "/api/v1/auth/me",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (req, res) => {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          type: "/errors/authentication-failed",
          title: "User not authenticated",
          status: 401,
          detail: "User ID not found in request",
          internal_code: "USER_NOT_AUTHENTICATED",
          severity: "HIGH",
        });
        return;
      }

      const parseResult = ProfileUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          type: '/errors/validation-error',
          title: 'Validation error',
          status: 400,
          detail: 'Request validation failed',
          severity: 'MEDIUM',
          issues: parseResult.error.issues.map((i) => ({
            path: i.path.join("."),
            code: i.code,
            message: i.message,
          })),
        });
        return;
      }

      const { displayName, email, popoverColor } = parseResult.data;

      try {
        const pool = getPool();
        
        // Build dynamic SET clause based on provided fields
        const updates: string[] = [];
        const values: any[] = [userId];
        let paramIndex = 2;

        if (displayName !== undefined) {
          updates.push(`display_name = $${paramIndex++}`);
          values.push(displayName);
        }
        if (email !== undefined) {
          updates.push(`email = $${paramIndex++}`);
          values.push(email);
        }
        if (popoverColor !== undefined) {
          updates.push(`avatar_color = $${paramIndex++}`);
          values.push(popoverColor);
        }

        if (updates.length === 0) {
          res.status(400).json({
            type: '/errors/validation-error',
            title: 'Validation error',
            status: 400,
            detail: 'No fields to update',
            severity: 'MEDIUM',
          });
          return;
        }

        const query = `
          UPDATE public.user_profiles
          SET ${updates.join(', ')}, updated_at = NOW()
          WHERE uuid = $1
          RETURNING uuid, idp_code, email, display_name, avatar_color, created_at, created_by, updated_at, updated_by, version
        `;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
          res.status(404).json({
            type: "/errors/not-found",
            title: "User profile not found",
            status: 404,
            detail: "User profile not found in database",
            internal_code: "USER_PROFILE_NOT_FOUND",
            severity: "HIGH",
          });
          return;
        }

        const profile = result.rows[0];
        res.json({
          success: true,
          profile: {
            uuid: profile.uuid,
            idpCode: profile.idp_code,
            email: profile.email,
            displayName: profile.display_name,
            avatarColor: profile.avatar_color,
            createdAt: profile.created_at,
            createdBy: profile.created_by,
            updatedAt: profile.updated_at,
            updatedBy: profile.updated_by,
            version: profile.version,
          }
        });
      } catch (error) {
        console.error("[Auth Me Patch] Error updating user profile:", error);
        res.status(500).json({
          type: "/errors/internal-error",
          title: "Failed to update user profile",
          status: 500,
          detail: "An error occurred while updating user profile",
          internal_code: "UPDATE_PROFILE_FAILED",
          severity: "HIGH",
        });
      }
    })
  );

  // GET /api/v1/auth/me - Fetch user profile from database
  router.get(
    "/api/v1/auth/me",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (req, res) => {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          type: "/errors/authentication-failed",
          title: "User not authenticated",
          status: 401,
          detail: "User ID not found in request",
          internal_code: "USER_NOT_AUTHENTICATED",
          severity: "HIGH",
        });
        return;
      }

      try {
        const pool = getPool();
        const result = await pool.query(
          `SELECT uuid, idp_code, email, display_name, avatar_color, created_at, created_by, updated_at, updated_by, version, deleted_at, deleted_by
           FROM public.user_profiles
           WHERE uuid = $1`,
          [userId]
        );

        if (result.rowCount === 0) {
          res.status(404).json({
            type: "/errors/not-found",
            title: "User profile not found",
            status: 404,
            detail: "User profile not found in database",
            internal_code: "USER_PROFILE_NOT_FOUND",
            severity: "HIGH",
          });
          return;
        }

        const profile = result.rows[0];
        res.json({
          success: true,
          profile: {
            uuid: profile.uuid,
            idpCode: profile.idp_code,
            email: profile.email,
            displayName: profile.display_name,
            avatarColor: profile.avatar_color,
            createdAt: profile.created_at,
            createdBy: profile.created_by,
            updatedAt: profile.updated_at,
            updatedBy: profile.updated_by,
            version: profile.version,
            deletedAt: profile.deleted_at,
            deletedBy: profile.deleted_by,
          }
        });
      } catch (error) {
        console.error("[Auth Me] Error fetching user profile:", error);
        res.status(500).json({
          type: "/errors/internal-error",
          title: "Failed to fetch user profile",
          status: 500,
          detail: "An error occurred while fetching user profile",
          internal_code: "FETCH_PROFILE_FAILED",
          severity: "HIGH",
        });
      }
    })
  );

  // GET /api/v1/entities/user_profiles/meta - Metadata endpoint
  router.get(
    "/api/v1/entities/user_profiles/meta",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    (_req, res) => {
      res.json({
        entity: "user_profiles",
        titleKey: "entities.userProfile.title",
        uid: "uuid",
        list: {
          auditingColumns: ["created_at", "created_by", "updated_at", "updated_by", "version"],
        },
      });
    }
  );

  // GET /api/v1/entities/user_profiles/:uuid/audit - Audit history endpoint
  const UuidParamSchema = z.object({ uuid: z.string().uuid() });
  const UserProfileAuditQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
  });

  router.get(
    "/api/v1/entities/user_profiles/:uuid/audit",
    rbacHandler([Permission.USER_PROFILE_READ_AUDIT]),
    (req, res, next) => {
      const r = UuidParamSchema.safeParse(req.params);
      if (!r.success) {
        res.status(400).json({
          type: '/errors/validation-error',
          title: 'Validation error',
          status: 400,
          detail: 'Request validation failed',
          severity: 'MEDIUM',
          issues: r.error.issues.map((i) => ({
            path: i.path.join("."),
            code: i.code,
            message: i.message,
          })),
        });
        return;
      }
      (req as any).params = r.data;
      next();
    },
    asyncHandler(async (req, res) => {
      const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
      const { page, limit } = req.query as unknown as z.infer<typeof UserProfileAuditQuerySchema>;
      const pool = getPool();
      const offset = (page - 1) * limit;

      try {
        const countQuery = `
          SELECT COUNT(*) as total
          FROM public.user_profiles_audit
          WHERE entity_uuid = $1
        `;

        const countResult = await pool.query(countQuery, [uuid]);
        const total = parseInt(countResult.rows[0].total, 10);

        const query = `
          SELECT
            audit.id,
            audit.entity_uuid,
            audit.action,
            audit.changed_at,
            audit.changed_by,
            creator.display_name as changed_by_display_name,
            creator.idp_code as changed_by_idp_code,
            audit.version,
            audit.delta
          FROM public.user_profiles_audit audit
          LEFT JOIN public.user_profiles creator
            ON audit.changed_by ~ '^[0-9a-fA-F-]{36}$'
           AND creator.uuid = audit.changed_by::uuid
          WHERE audit.entity_uuid = $1
          ORDER BY audit.changed_at DESC, audit.id DESC
          LIMIT $2 OFFSET $3
        `;

        const result = await pool.query(query, [uuid, limit, offset]);

        const data = result.rows.map((row: any) => ({
          id: row.id.toString(),
          entity_uuid: row.entity_uuid,
          action: row.action,
          changed_at: row.changed_at.toISOString(),
          changed_by: row.changed_by,
          changed_by_display_name: row.changed_by_display_name,
          changed_by_idp_code: row.changed_by_idp_code,
          version: row.version,
          delta: row.delta,
        }));

        res.json({
          data,
          pagination: {
            page,
            limit,
            total,
            hasMore: offset + limit < total,
          },
        });
      } catch (e) {
        console.error('[User Profile Audit Error]', {
          error: e,
          stack: e instanceof Error ? e.stack : undefined,
          message: e instanceof Error ? e.message : String(e)
        });
        res.status(500).json({
          type: '/errors/audit-failed',
          title: 'Audit retrieval failed',
          status: 500,
          detail: 'An unexpected error occurred while fetching user profile audit history',
          severity: 'HIGH',
        });
        return;
      }
    })
  );

  return router;
}
