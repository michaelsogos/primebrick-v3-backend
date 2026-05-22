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
import { UserProfilesDal } from "./user-profiles-dal.js";
import { CasdoorApiClient } from "./casdoor-api-client.js";

const LoginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export function authRouter() {
  const router = Router();
  let auditService: AuditService | null = null;
  let dal: UserProfilesDal | null = null;

  const getAuditService = () => {
    if (auditService) return auditService;
    const pool = getPool();
    auditService = new AuditService(pool);
    return auditService;
  };

  const getDal = () => {
    if (dal) return dal;
    const pool = getPool();
    const auditSvc = getAuditService();
    dal = new UserProfilesDal(pool, auditSvc);
    return dal;
  };

  let casdoorClient: CasdoorApiClient | null = null;

  const getCasdoorClient = async (): Promise<CasdoorApiClient | null> => {
    if (casdoorClient) return casdoorClient;
    try {
      const pool = getPool();
      const dbConfig = await loadAuthConfigFromDb(pool);
      if (!dbConfig.casdoorBuiltinClientId || !dbConfig.casdoorBuiltinClientSecret) {
        console.warn("[Auth Router] Casdoor builtin credentials not configured; skipping Casdoor sync");
        return null;
      }
      casdoorClient = new CasdoorApiClient({
        endpoint: dbConfig.casdoorEndpoint || process.env.CASDOOR_ENDPOINT || "http://localhost:8000",
        orgName: dbConfig.casdoorOrganization || "acme",
        clientId: dbConfig.casdoorBuiltinClientId,
        clientSecret: dbConfig.casdoorBuiltinClientSecret,
      });
      return casdoorClient;
    } catch (error) {
      console.error("[Auth Router] Failed to create Casdoor API client:", error);
      return null;
    }
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

        // DEBUG: Check token size before setting cookie
        const accessTokenSize = access_token ? access_token.length : 0;
        const refreshTokenSize = refresh_token ? refresh_token.length : 0;
        console.log(`[Auth Login] Token sizes - Access: ${accessTokenSize} bytes, Refresh: ${refreshTokenSize} bytes`);
        if (accessTokenSize > 4096) {
          console.warn('[Auth Login] WARNING: Access token exceeds 4KB cookie limit!');
        }

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

        console.log("[Auth Login] Cookies set successfully");

        // Decode JWT payload on backend to extract user profile data
        const tokenParts = access_token.split('.');
        const encodedPayload = tokenParts[1];
        const rawPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
        const claims = JSON.parse(rawPayload);

        // Return only user profile data to frontend
        const roles = (claims.roles || []).filter((role: any) => role.isEnabled !== false).map((role: any) => ({
          name: role.name,
          display_name: role.displayName,
          owner: role.owner
        }));

        console.log(`[Auth Login] Roles parsed: ${JSON.stringify(roles.map((r: any) => r.name))}`);

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
            display_name: claims.displayName || claims.name || claims.username || claims.preferred_username,
            email: claims.email,
            organization: claims.organization,
            expires_at: claims.exp * 1000,
            roles
          }
        });

        console.log("[Auth Login] Response sent successfully");
      } catch (e) {
        const error = e as Error;
        console.error("💥 [AUTH EXCEPTION] Eccezione di rete o parsing durante la chiamata a Casdoor:", {
          error: error.message,
          stack: error.stack,
        });
        console.error("[Auth Login] Error in login response:", error);

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

        // Sync Casdoor user data to local Primebrick DB
        try {
          const cdClient = await getCasdoorClient();
          if (cdClient) {
            console.log("[Auth Refresh] Starting Casdoor→Primebrick sync");
            console.log(`[Auth Refresh] claims.sub=${claims.sub}, claims.name=${claims.name}, orgName=${orgName}`);
            const casdoorUserId = `${orgName}/${claims.name}`;
            console.log(`[Auth Refresh] Constructed Casdoor user ID: ${casdoorUserId}`);
            const casdoorUser = await cdClient.getUser(casdoorUserId);
            if (casdoorUser) {
              const idpCode = casdoorUser.id || casdoorUserId;
              console.log(`[Auth Refresh] Casdoor user found with id=${casdoorUser.id}, using idpCode=${idpCode}`);
              const existing = await getDal().getByIdpCode(idpCode);
              const roleNames = (casdoorUser.roles || []).map((r: any) => r.name);
              if (existing) {
                console.log(`[Auth Refresh] Found local profile ${existing.uuid} with current idp_code=${existing.idp_code}`);
                const updateData: any = {
                  display_name: casdoorUser.displayName || existing.display_name,
                  email: casdoorUser.email || existing.email,
                  is_active: !casdoorUser.isForbidden,
                  is_admin: casdoorUser.isAdmin || false,
                  roles: roleNames.length > 0 ? roleNames : undefined,
                  last_synced_at: new Date(),
                };
                if (existing.idp_code !== idpCode) {
                  console.log(`[Auth Refresh] Updating idp_code from ${existing.idp_code} to ${idpCode}`);
                  updateData.idp_code = idpCode;
                }
                await getDal().updateProfile(existing.uuid, updateData);
                console.log("[Auth Refresh] Casdoor→Primebrick sync completed successfully");
                
                // Directly sync idp_org and idp_username from JWT claims (immutable fields, defensive update)
                const jwtIdpOrg = claims.organization || claims.owner || null;
                const jwtIdpUsername = claims.name || claims.username || claims.preferred_username || null;
                if (jwtIdpOrg || jwtIdpUsername) {
                  try {
                    const pool = getPool();
                    await pool.query(
                      `UPDATE public.user_profiles
                       SET idp_org = COALESCE($2, idp_org),
                           idp_username = COALESCE($3, idp_username),
                           updated_at = now(),
                           updated_by = $4,
                           version = version + 1
                       WHERE uuid = $1`,
                      [existing.uuid, jwtIdpOrg, jwtIdpUsername, existing.uuid]
                    );
                    console.log(`[Auth Refresh] Synced idp_org=${jwtIdpOrg}, idp_username=${jwtIdpUsername}`);
                  } catch (e) {
                    console.error("[Auth Refresh] Failed to sync idp_org/idp_username:", e);
                  }
                }
              } else {
                console.log(`[Auth Refresh] Local profile not found for claims.sub=${claims.sub}, skipping sync`);
              }
            } else {
              console.log("[Auth Refresh] Casdoor user not found, skipping sync");
            }
          } else {
            console.log("[Auth Refresh] Casdoor client not available, skipping sync");
          }
        } catch (syncError) {
          console.error("[Auth Refresh] Casdoor→Primebrick sync failed (non-critical):", syncError);
        }

        // Return only user profile data to frontend
        const roles = (claims.roles || []).filter((role: any) => role.isEnabled !== false).map((role: any) => ({
          name: role.name,
          display_name: role.displayName,
          owner: role.owner
        }));

        res.json({
          success: true,
          user: {
            username: claims.name || claims.username || claims.preferred_username,
            display_name: claims.displayName || claims.name || claims.username || claims.preferred_username,
            email: claims.email,
            organization: claims.organization,
            expires_at: claims.exp * 1000,
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
    display_name: z.string().optional(),
    email: z.string().email().optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    avatar_initials: z.string().min(1).optional(),
  }).strict();

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

      const { display_name, email, avatar_color, avatar_initials } = parseResult.data;

      // Validate avatar_initials is provided if avatar_color is being updated
      if (avatar_color !== undefined && !avatar_initials) {
        res.status(400).json({
          type: '/errors/validation-error',
          title: 'Validation error',
          status: 400,
          detail: 'avatar_initials is required when updating avatar_color',
          severity: 'MEDIUM',
        });
        return;
      }

      try {
        // Build update body with only provided fields
        const updateBody: { display_name?: string; email?: string; avatar_color?: string; avatar_initials?: string } = {};
        if (display_name !== undefined) updateBody.display_name = display_name;
        if (email !== undefined) updateBody.email = email;
        if (avatar_color !== undefined) updateBody.avatar_color = avatar_color;
        if (avatar_initials !== undefined) updateBody.avatar_initials = avatar_initials;

        if (Object.keys(updateBody).length === 0) {
          res.status(400).json({
            type: '/errors/validation-error',
            title: 'Validation error',
            status: 400,
            detail: 'No fields to update',
            severity: 'MEDIUM',
          });
          return;
        }

        // Use DAL to update profile (Repository.update() handles audit logging)
        await getDal().updateProfile(userId, updateBody);

        // Fetch updated profile with joins
        const profile = await getDal().getByUuid(userId);

        // Sync to Casdoor (best-effort, don't block on failure)
        if (profile) {
          try {
            console.log("[Auth Me Patch] Starting Primebrick→Casdoor sync for user", profile.idp_code);
            const cdClient = await getCasdoorClient();
            if (cdClient) {
              // Generate SVG if avatar_color changed
              let svgDataUri: string | undefined;
              if (avatar_color && avatar_initials) {
                const { generateHexagonAvatarSvg } = await import("./avatar-svg-generator.js");
                svgDataUri = generateHexagonAvatarSvg(avatar_initials, avatar_color);
              }

              await cdClient.updateUser({
                id: profile.idp_code,
                owner: profile.idp_org || undefined,
                name: profile.idp_username || undefined,
                displayName: updateBody.display_name || profile.display_name,
                email: updateBody.email || profile.email,
                customFields: {
                  app_avatar_color: avatar_color || profile.avatar_color,
                  app_avatar_shape: "hexagon",
                  app_avatar_letters: avatar_initials || profile.avatar_initials,
                },
                ...(svgDataUri && { avatar: svgDataUri }),
              });
              console.log("[Auth Me Patch] Primebrick→Casdoor sync completed successfully");
            } else {
              console.log("[Auth Me Patch] Casdoor client not available, skipping sync");
            }
          } catch (syncError) {
            console.error("[Auth Me Patch] Primebrick→Casdoor sync failed (non-critical):", syncError);
          }
        }

        if (!profile) {
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

        res.json({
          success: true,
          profile: {
            idp_code: profile.idp_code,
            email: profile.email,
            display_name: profile.display_name,
            avatar_color: profile.avatar_color,
            avatar_initials: profile.avatar_initials,
            created_at: profile.created_at,
            created_by: profile.created_by,
            created_by_name: profile.created_by_name,
            updated_at: profile.updated_at,
            updated_by: profile.updated_by,
            updated_by_name: profile.updated_by_name,
            version: profile.version,
            deleted_at: profile.deleted_at,
            deleted_by: profile.deleted_by,
            deleted_by_name: profile.deleted_by_name,
          }
        });
      } catch (error) {
        console.error("[Auth Me Patch] Error updating user profile:", error);
        res.status(500).json({
          type: "/errors/internal-error",
          title: "Failed to update user profile",
          status: 500,
          detail: "An unexpected error occurred while updating user profile",
          internal_code: "PROFILE_UPDATE_FAILED",
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
        const profile = await getDal().getByUuid(userId);

        if (!profile) {
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

        res.json({
          success: true,
          profile: {
            idp_code: profile.idp_code,
            idp_org: profile.idp_org,
            idp_username: profile.idp_username,
            email: profile.email,
            display_name: profile.display_name,
            avatar_color: profile.avatar_color,
            avatar_initials: profile.avatar_initials,
            created_at: profile.created_at,
            created_by: profile.created_by,
            created_by_name: profile.created_by_name,
            updated_at: profile.updated_at,
            updated_by: profile.updated_by,
            updated_by_name: profile.updated_by_name,
            version: profile.version,
            deleted_at: profile.deleted_at,
            deleted_by: profile.deleted_by,
            deleted_by_name: profile.deleted_by_name,
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

  // === Admin user management endpoints ===

  const CreateUserSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(8),
    display_name: z.string().min(1),
    email: z.string().email(),
    roles: z.array(z.string()).optional(),
    avatar_initials: z.string().min(1),
  });

  const UpdateUserSchema = z.object({
    display_name: z.string().optional(),
    email: z.string().email().optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    is_active: z.boolean().optional(),
    is_admin: z.boolean().optional(),
    roles: z.array(z.string()).optional(),
  }).strict();

  // POST /api/v1/auth/users - Create user (admin only)
  router.post(
    "/api/v1/auth/users",
    rbacHandler([Permission.USERS_CREATE_SINGLE]),
    asyncHandler(async (req, res) => {
      const parseResult = CreateUserSchema.safeParse(req.body);
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

      const { username, password, display_name, email, roles, avatar_initials } = parseResult.data;

      // Validate avatar_initials is provided
      if (!avatar_initials) {
        res.status(400).json({
          type: "/errors/validation-error",
          title: "Validation error",
          status: 400,
          detail: "avatar_initials is required",
          severity: "MEDIUM",
        });
        return;
      }

      try {
        // Default color from palette
        const defaultColor = "#4f46e5";

        // 1. Create in Casdoor
        console.log("[Auth Users Create] Creating user in Casdoor:", username);
        const cdClient = await getCasdoorClient();
        let casdoorUserId: string | null = null;
        let idpOrg = process.env.CASDOOR_ORGANIZATION || "acme";
        let idpUsername = username;
        if (cdClient) {
          const avatarColor = defaultColor;

          // Generate SVG using initials from FE
          const { generateHexagonAvatarSvg } = await import("./avatar-svg-generator.js");
          const svgDataUri = generateHexagonAvatarSvg(avatar_initials, avatarColor);

          const newUser = await cdClient.addUser({
            owner: idpOrg,  // REQUIRED
            name: username,
            displayName: display_name,
            email,
            password,
            roles: (roles || []).map((r) => ({ name: r })),
            customFields: {
              app_avatar_color: avatarColor,
              app_avatar_shape: "hexagon",
              app_avatar_letters: avatar_initials,
            },
            avatar: svgDataUri,
          });
          if (!newUser || !newUser.id) {
            throw new Error("Casdoor user creation did not return a UUID");
          }
          casdoorUserId = newUser.id;
          idpOrg = newUser.owner || process.env.CASDOOR_ORGANIZATION || "acme";
          idpUsername = newUser.name || username;
          console.log(`[Auth Users Create] Casdoor user UUID: ${casdoorUserId}, org: ${idpOrg}, username: ${idpUsername}`);
        } else {
          console.log("[Auth Users Create] Casdoor client not available, skipping Casdoor creation");
        }

        // 2. Create in local DB via JIT-style provisioning
        const idpCode = casdoorUserId;
        console.log(`[Auth Users Create] Creating local profile with idpCode=${idpCode}, idp_org=${idpOrg}, idp_username=${idpUsername}`);
        const now = new Date();
        const newUuid = require("node:crypto").randomUUID();
        const pool = getPool();
        await pool.query(
          `INSERT INTO public.user_profiles
           (uuid, idp_code, email, display_name, idp_org, idp_username, avatar_color, avatar_initials, is_active, is_admin, roles, created_at, created_by, updated_at, updated_by, version)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false, $9, $10, $11, 1)`,
          [newUuid, idpCode, email, display_name, idpOrg, idpUsername, defaultColor, avatar_initials, roles ? JSON.stringify(roles) : null, now, req.user?.id || newUuid, now, req.user?.id || newUuid]
        );
        console.log(`[Auth Users Create] Local profile created with uuid=${newUuid}`);

        res.status(201).json({
          success: true,
          user: { idp_code: idpCode, username, display_name, email },
        });
      } catch (error) {
        console.error("[Auth Users Create] Error creating user:", error);
        res.status(500).json({
          type: "/errors/internal-error",
          title: "Failed to create user",
          status: 500,
          detail: "An unexpected error occurred while creating the user",
          internal_code: "USER_CREATE_FAILED",
          severity: "HIGH",
        });
      }
    })
  );

  // PATCH /api/v1/auth/users/:uuid - Update user (admin only)
  router.patch(
    "/api/v1/auth/users/:uuid",
    rbacHandler([Permission.USERS_UPDATE_SINGLE]),
    asyncHandler(async (req, res) => {
      const targetUuid = typeof req.params.uuid === "string" ? req.params.uuid : "";
      if (!targetUuid || !z.string().uuid().safeParse(targetUuid).success) {
        res.status(400).json({
          type: "/errors/validation-error",
          title: "Invalid UUID",
          status: 400,
          detail: "User UUID is required and must be a valid UUID",
          severity: "MEDIUM",
        });
        return;
      }

      const parseResult = UpdateUserSchema.safeParse(req.body);
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

      const body = parseResult.data;
      const updateBody: any = {};
      if (body.display_name !== undefined) updateBody.display_name = body.display_name;
      if (body.email !== undefined) updateBody.email = body.email;
      if (body.avatar_color !== undefined) updateBody.avatar_color = body.avatar_color;
      if (body.is_active !== undefined) updateBody.is_active = body.is_active;
      if (body.is_admin !== undefined) updateBody.is_admin = body.is_admin;
      if (body.roles !== undefined) updateBody.roles = body.roles;

      if (Object.keys(updateBody).length === 0) {
        res.status(400).json({
          type: "/errors/validation-error",
          title: "Validation error",
          status: 400,
          detail: "No fields to update",
          severity: "MEDIUM",
        });
        return;
      }

      try {
        const existing = await getDal().getByUuid(targetUuid);
        if (!existing) {
          res.status(404).json({
            type: "/errors/not-found",
            title: "User not found",
            status: 404,
            detail: "User profile not found in database",
            internal_code: "USER_NOT_FOUND",
            severity: "HIGH",
          });
          return;
        }

        await getDal().updateProfile(targetUuid, updateBody);

        // Sync to Casdoor
        try {
          console.log("[Auth Users Update] Starting Primebrick→Casdoor sync for user", existing.idp_code);
          const cdClient = await getCasdoorClient();
          if (cdClient) {
            const casdoorUpdate: any = { 
              id: existing.idp_code,
              owner: existing.idp_org || undefined,
              name: existing.idp_username || undefined,
            };
            if (body.display_name !== undefined) casdoorUpdate.displayName = body.display_name;
            if (body.email !== undefined) casdoorUpdate.email = body.email;
            if (body.is_active !== undefined) casdoorUpdate.isForbidden = !body.is_active;
            if (body.is_admin !== undefined) casdoorUpdate.isAdmin = body.is_admin;
            console.log(`[Auth Users Update] Syncing fields to Casdoor: ${JSON.stringify(Object.keys(casdoorUpdate).filter(k => k !== 'id'))}`);
            await cdClient.updateUser(casdoorUpdate);
            console.log("[Auth Users Update] Primebrick→Casdoor sync completed successfully");
          } else {
            console.log("[Auth Users Update] Casdoor client not available, skipping sync");
          }
        } catch (syncError) {
          console.error("[Auth Users Update] Primebrick→Casdoor sync failed (non-critical):", syncError);
        }

        const updated = await getDal().getByUuid(targetUuid);
        res.json({ success: true, profile: updated });
      } catch (error) {
        console.error("[Auth Users Update] Error updating user:", error);
        res.status(500).json({
          type: "/errors/internal-error",
          title: "Failed to update user",
          status: 500,
          detail: "An unexpected error occurred while updating the user",
          internal_code: "USER_UPDATE_FAILED",
          severity: "HIGH",
        });
      }
    })
  );

  // DELETE /api/v1/auth/users/:uuid - Soft delete user (admin only)
  router.delete(
    "/api/v1/auth/users/:uuid",
    rbacHandler([Permission.USERS_DELETE_SINGLE]),
    asyncHandler(async (req, res) => {
      const targetUuid = typeof req.params.uuid === "string" ? req.params.uuid : "";
      if (!targetUuid || !z.string().uuid().safeParse(targetUuid).success) {
        res.status(400).json({
          type: "/errors/validation-error",
          title: "Invalid UUID",
          status: 400,
          detail: "User UUID is required and must be a valid UUID",
          severity: "MEDIUM",
        });
        return;
      }

      try {
        const existing = await getDal().getByUuid(targetUuid);
        if (!existing) {
          res.status(404).json({
            type: "/errors/not-found",
            title: "User not found",
            status: 404,
            detail: "User profile not found in database",
            internal_code: "USER_NOT_FOUND",
            severity: "HIGH",
          });
          return;
        }

        // Soft delete in local DB
        console.log(`[Auth Users Delete] Soft deleting local profile ${targetUuid}`);
        await getDal().softDelete(targetUuid);

        // Disable in Casdoor (soft-delete semantics)
        try {
          console.log("[Auth Users Delete] Disabling user in Casdoor:", existing.idp_code);
          const cdClient = await getCasdoorClient();
          if (cdClient) {
            await cdClient.updateUser({
              id: existing.idp_code,
              owner: existing.idp_org || undefined,
              name: existing.idp_username || undefined,
              isForbidden: true,
            });
            console.log("[Auth Users Delete] Primebrick→Casdoor sync completed successfully");
          } else {
            console.log("[Auth Users Delete] Casdoor client not available, skipping sync");
          }
        } catch (syncError) {
          console.error("[Auth Users Delete] Primebrick→Casdoor sync failed (non-critical):", syncError);
        }

        res.json({ success: true });
      } catch (error) {
        console.error("[Auth Users Delete] Error deleting user:", error);
        res.status(500).json({
          type: "/errors/internal-error",
          title: "Failed to delete user",
          status: 500,
          detail: "An unexpected error occurred while deleting the user",
          internal_code: "USER_DELETE_FAILED",
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

      try {
        const result = await getDal().getUserProfileAudit(uuid, page, limit);
        res.json(result);
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
