/**
 * AuthSessionService — business logic for authentication session flows.
 *
 * Owns:
 *   - Casdoor OAuth token exchange (login + refresh)
 *   - JWT payload decoding + claim extraction
 *   - Casdoor→Primebrick profile sync on refresh
 *   - "me" profile fetch + "me" profile update (self-service)
 *
 * The service is request-context-free. It returns plain result objects; the
 * controller is responsible for setting cookies on `res` and shaping the JSON
 * response. Errors are thrown as `ApiError` subclasses.
 *
 * Cookie policy:
 *   The service returns the raw tokens (`access_token`, `refresh_token`,
 *   `expires_in`) in the result. The controller's `setAuthCookies` helper
 *   writes them as httpOnly cookies. This keeps `res` out of the service.
 */

import type { Pool } from "pg";

import { getAuthConfig } from "../config.js";
import { UserProfilesDal } from "../user-profiles-dal.js";
import { UserPasskeysDal } from "../user-passkeys-dal.js";
import { CasdoorService } from "./casdoor.service.js";
import { requireActor } from "@primebrick/sdk";
import {
  ApiError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../http/api-errors.js";
import type { LoginBody, ProfileUpdate } from "../dto.js";
import type { UserProfileDetailDto } from "../user-profiles-dal.js";

// --- Result types ---------------------------------------------------------

export interface TokenSet {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface LoginResult {
  tokens: TokenSet;
  /** The Casdoor organization used for the exchange (useful for sync). */
  orgName: string;
  /** Decoded JWT claims (used by the controller to build the user response). */
  claims: Record<string, unknown>;
}

export interface RefreshResult extends LoginResult {}

export interface MeProfileResponse {
  profile: UserProfileDetailDto;
  has_passkey?: boolean;
  auth_method_enforcer_dismissed?: boolean;
}

// --- Service --------------------------------------------------------------

export class AuthSessionService {
  constructor(
    private pool: Pool,
    private dal: UserProfilesDal,
    private casdoor: CasdoorService,
  ) {}

  // --- Login ---------------------------------------------------------------

  async login(input: LoginBody): Promise<LoginResult> {
    const cfg = await getAuthConfig();
    const tokenUrl = `${cfg.casdoor_endpoint}/api/login/oauth/access_token`;
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("client_id", cfg.oidc.client_id!);
    formData.append("client_secret", cfg.oidc.client_secret!);
    formData.append("username", input.username);
    formData.append("password", input.password);
    formData.append("scope", "openid profile email");
    formData.append("organization", cfg.casdoor_organization!);

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw this.casdoorAuthError(errorText, response.status, "/api/v1/auth/login");
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };
    const claims = this.decodeJwtPayload(data.access_token);

    // Email-verified guard — gated by auth_configurations flag.
    if (cfg.enable_email_verification_check && claims.emailVerified === false) {
      throw new UnauthorizedError("The user email isn't verified yet", {
        internal_code: "email_not_verified",
      });
    }
    const roles = this.extractRoles(claims);
    if (!roles || roles.length === 0) {
      throw new ApiError(
        "/errors/forbidden",
        "User doesn't have permission",
        403,
        "User doesn't have permission",
        { internal_code: "user_no_permission", severity: "HIGH" },
      );
    }

    return {
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      },
      orgName: cfg.casdoor_organization!,
      claims,
    };
  }

  // --- Refresh -------------------------------------------------------------

  async refresh(refreshToken: string): Promise<RefreshResult> {
    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token provided", {
        internal_code: "REFRESH_TOKEN_MISSING",
      });
    }

    const cfg = await getAuthConfig();
    const tokenUrl = `${cfg.casdoor_endpoint}/api/login/oauth/access_token`;
    const formData = new URLSearchParams();
    formData.append("grant_type", "refresh_token");
    formData.append("client_id", cfg.oidc.client_id!);
    formData.append("client_secret", cfg.oidc.client_secret!);
    formData.append("refresh_token", refreshToken);
    formData.append("scope", "openid profile email");
    formData.append("organization", cfg.casdoor_organization!);

    let response: Response;
    try {
      response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
    } catch (e) {
      throw new ApiError(
        "/errors/internal-error",
        "Authentication service error",
        500,
        "An error occurred while contacting the authentication service",
        { internal_code: "AUTH_SERVICE_ERROR", severity: "HIGH" },
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw this.casdoorAuthError(errorText, response.status, "/api/v1/auth/refresh");
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };
    const claims = this.decodeJwtPayload(data.access_token);

    // Best-effort Casdoor→Primebrick profile sync (non-critical).
    await this.syncProfileFromCasdoor(claims, cfg.casdoor_organization!).catch((syncError) => {
      console.error("[AuthSessionService] Casdoor→Primebrick sync failed (non-critical):", syncError);
    });

    return {
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      },
      orgName: cfg.casdoor_organization!,
      claims,
    };
  }

  // --- Me (self-service profile) -------------------------------------------

  async getMe(userUuid: string): Promise<MeProfileResponse> {
    const profile = await this.dal.getByUuid(userUuid);
    if (!profile) {
      throw new NotFoundError("User profile not found in database", {
        internal_code: "USER_PROFILE_NOT_FOUND",
      });
    }

    // Include passkey info for the FE auth method enforcer prompt logic
    const idResult = await this.pool.query(
      `SELECT id, auth_method_enforcer_dismissed FROM user_profiles WHERE uuid = $1`,
      [userUuid],
    );
    const profileId = idResult.rows[0]?.id;
    const authMethodEnforcerDismissed = idResult.rows[0]?.auth_method_enforcer_dismissed ?? false;

    let hasPasskey = false;
    if (profileId) {
      const passkeysDal = new UserPasskeysDal(this.pool);
      const count = await passkeysDal.countByUserProfileId(BigInt(profileId));
      hasPasskey = count > 0;
    }

    return { profile, has_passkey: hasPasskey, auth_method_enforcer_dismissed: authMethodEnforcerDismissed };
  }

  /**
   * Dismiss the auth method enforcer prompt for the current user.
   * Sets `auth_method_enforcer_dismissed = true` on the user_profile.
   *
   * Refuses with 403 if `passkey_required` is enabled in auth config —
   * a mandatory passkey cannot be dismissed, even if the FE is bypassed.
   */
  async dismissAuthMethodEnforcer(userUuid: string): Promise<{ success: true }> {
    const cfg = getAuthConfig();
    if (cfg.passkey_required) {
      throw new ApiError(
        "/errors/passkey-required",
        "Passkey enrollment is mandatory",
        403,
        "This server requires all users to enroll a passkey. The dismissal request was refused.",
        { internal_code: "PASSKEY_REQUIRED", severity: "HIGH" },
      );
    }

    const actor = requireActor();
    await this.pool.query(
      `UPDATE user_profiles SET auth_method_enforcer_dismissed = true, updated_at = now(), updated_by = $1 WHERE uuid = $2`,
      [actor, userUuid],
    );
    return { success: true };
  }

  async updateMe(userUuid: string, input: ProfileUpdate): Promise<MeProfileResponse> {
    const { display_name, email, avatar_color, avatar_initials } = input;

    if (avatar_color !== undefined && !avatar_initials) {
      throw new ValidationError("avatar_initials is required when updating avatar_color", {
        internal_code: "AVATAR_INITIALS_REQUIRED",
      });
    }

    const updateBody: Record<string, unknown> = {};
    if (display_name !== undefined) updateBody.display_name = display_name;
    if (email !== undefined) updateBody.email = email;
    if (avatar_color !== undefined) updateBody.avatar_color = avatar_color;
    if (avatar_initials !== undefined) updateBody.avatar_initials = avatar_initials;

    if (Object.keys(updateBody).length === 0) {
      throw new ValidationError("No fields to update", { internal_code: "NO_FIELDS" });
    }

    const profile = await this.dal.getByUuid(userUuid);
    if (!profile) {
      throw new NotFoundError("User profile not found in database", {
        internal_code: "USER_PROFILE_NOT_FOUND",
      });
    }

    // Sync to Casdoor first (non-best-effort: fail if sync fails).
    const syncTimestamp = new Date();
    const cdClient = await this.casdoor.getClient();
    if (cdClient) {
      let svgDataUri: string | undefined;
      if (avatar_color && avatar_initials) {
        const { generateHexagonAvatarSvg } = await import("../avatar-svg-generator.js");
        svgDataUri = generateHexagonAvatarSvg(avatar_initials, avatar_color);
      }

      const syncSuccess = await cdClient.updateUser({
        id: profile.idp_code,
        owner: profile.idp_org || undefined,
        name: profile.idp_username || undefined,
        displayName: (display_name as string) || profile.display_name,
        email: (email as string) || profile.email,
        customFields: {
          app_avatar_color: (avatar_color as string) || profile.avatar_color,
          app_avatar_shape: "hexagon",
          app_avatar_letters: (avatar_initials as string) || profile.avatar_initials,
        },
        ...(svgDataUri && { avatar: svgDataUri }),
      } as any);

      if (!syncSuccess) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor sync failed",
          502,
          "Failed to sync profile to Casdoor",
          {
            instance: "/api/v1/auth/me",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
            extra: {
              issues: {
                error_details: "Casdoor API returned non-success status",
                casdoor_user_id: profile.idp_code,
                attempted_fields: Object.keys(updateBody),
              },
            },
          },
        );
      }
    }

    updateBody.last_synced_at = syncTimestamp;
    await this.dal.updateProfile(userUuid, updateBody as any);

    const updated = await this.dal.getByUuid(userUuid);
    if (!updated) {
      throw new ApiError(
        "/errors/internal-error",
        "Failed to retrieve updated profile",
        500,
        "Profile update succeeded but re-fetch failed",
        { internal_code: "PROFILE_REFETCH_FAILED", severity: "HIGH" },
      );
    }
    return { profile: updated };
  }

  // --- Internal helpers ----------------------------------------------------

  private decodeJwtPayload(token: string): Record<string, any> {
    const parts = token.split(".");
    const encodedPayload = parts[1];
    const rawPayload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    return JSON.parse(rawPayload);
  }

  private extractRoles(claims: Record<string, any>): Array<{ name: string; display_name: string; owner: string }> {
    return (claims.roles || [])
      .filter((role: any) => role.isEnabled !== false)
      .map((role: any) => ({
        name: role.name,
        display_name: role.displayName,
        owner: role.owner,
      }));
  }

  /**
   * Build an `ApiError` from a Casdoor error response, preserving the
   * account-locked detection and the 400→401 status mapping.
   */
  private casdoorAuthError(errorText: string, httpStatus: number, instance: string): ApiError {
    let errorDetail = "Authentication failed";
    let errorCode = "AUTH_FAILED";
    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.error_description || errorJson.error || errorDetail;
      errorCode = errorJson.error || errorCode;

      if (errorJson.error === "invalid_grant" && errorJson.error_description) {
        const desc: string = errorJson.error_description;
        if (desc.includes("too many times")) {
          const minutesMatch = desc.match(/wait for (\d+) minutes/);
          const minutes = minutesMatch ? parseInt(minutesMatch[1]!, 10) : 0;
          errorCode = "account_locked";
          errorDetail = `Account locked due to too many failed attempts. Wait ${minutes} minutes.`;
        }
      }
    } catch {
      errorDetail = errorText || errorDetail;
    }

    const mappedStatus = httpStatus === 400 ? 401 : httpStatus;
    return new ApiError(
      "/errors/authentication-failed",
      instance === "/api/v1/auth/refresh" ? "Token refresh failed" : "Authentication failed",
      mappedStatus,
      errorDetail,
      { instance, internal_code: errorCode, severity: "HIGH" },
    );
  }

  /**
   * Best-effort Casdoor→Primebrick profile sync on token refresh.
   * Mirrors the original inline logic but without the verbose debug logs.
   */
  private async syncProfileFromCasdoor(claims: Record<string, any>, orgName: string): Promise<void> {
    const cdClient = await this.casdoor.getClient();
    if (!cdClient) return;

    const casdoorUserId = `${orgName}/${claims.name}`;
    const casdoorUser = await cdClient.getUser(casdoorUserId);
    if (!casdoorUser) return;

    const idpCode = casdoorUser.id || casdoorUserId;
    const existing = await this.dal.getByIdpCode(idpCode);
    if (!existing) return;

    const roleNames = (casdoorUser.roles || []).map((r: any) => r.name);
    const updateData: Record<string, unknown> = {
      display_name: casdoorUser.displayName || existing.display_name,
      email: casdoorUser.email || existing.email,
      is_active: !casdoorUser.isForbidden,
      is_admin: casdoorUser.isAdmin || false,
      is_verified: casdoorUser.isVerified || false,
      email_verified: casdoorUser.emailVerified || false,
      issuer: claims.iss || null,
      roles: roleNames.length > 0 ? roleNames : undefined,
      last_synced_at: new Date(),
    };
    if (existing.idp_code !== idpCode) {
      updateData.idp_code = idpCode;
    }
    await this.dal.updateProfile(existing.uuid, updateData as any);

    // Defensive sync of immutable idp_org / idp_username from JWT claims.
    const jwtIdpOrg = claims.organization || claims.owner || null;
    const jwtIdpUsername = claims.name || claims.username || claims.preferred_username || null;
    if (jwtIdpOrg || jwtIdpUsername) {
      await this.pool
        .query(
          `UPDATE public.user_profiles
           SET idp_org = COALESCE($2, idp_org),
               idp_username = COALESCE($3, idp_username),
               updated_at = now(),
               updated_by = $4,
               version = version + 1
           WHERE uuid = $1`,
          [existing.uuid, jwtIdpOrg, jwtIdpUsername, existing.uuid],
        )
        .catch((e) => {
          console.error("[AuthSessionService] Failed to sync idp_org/idp_username:", e);
        });
    }
  }
}

// --- Cookie helper (controller-side) --------------------------------------

/**
 * Writes the auth tokens as httpOnly cookies on the response. This is the ONLY
 * place in the auth flow that touches `res` for cookies — kept in a small,
 * explicit helper so services stay response-context-free.
 */
export function setAuthCookies(res: import("express").Response, tokens: TokenSet): void {
  res.clearCookie("access_token", { path: "/" });
  res.cookie("access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: tokens.expires_in * 1000,
    path: "/",
  });
  if (tokens.refresh_token) {
    res.cookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/api/v1/auth/refresh",
    });
  }
}

/** Clear the refresh-token cookie (used on refresh failure). */
export function clearRefreshCookie(res: import("express").Response): void {
  res.clearCookie("refresh_token", { path: "/api/v1/auth/refresh" });
}

/**
 * Build the public user object returned by login/refresh from decoded JWT
 * claims. Pure function — no I/O.
 */
export function buildUserFromClaims(claims: Record<string, any>): {
  username: string;
  display_name: string;
  email: string;
  organization: string;
  expires_at: number;
  roles: Array<{ name: string; display_name: string; owner: string }>;
} {
  const roles = (claims.roles || [])
    .filter((role: any) => role.isEnabled !== false)
    .map((role: any) => ({
      name: role.name,
      display_name: role.displayName,
      owner: role.owner,
    }));
  return {
    username: claims.name || claims.username || claims.preferred_username,
    display_name: claims.displayName || claims.name || claims.username || claims.preferred_username,
    email: claims.email,
    organization: claims.organization,
    expires_at: claims.exp * 1000,
    roles,
  };
}
