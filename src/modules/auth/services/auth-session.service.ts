/**
 * AuthSessionService — business logic for authentication session flows.
 *
 * Owns:
 *   - Casdoor OAuth token exchange (login + refresh)
 *   - JWT payload decoding + claim extraction
 *   - "me" profile fetch + "me" profile update (self-service)
 *
 * Note: /auth/refresh is a pure OAuth token exchange — it does NOT sync the
 * user_profile from Casdoor. Profile freshness is handled by resolveInternalUuid
 * (auth middleware, every authed request), UserService.updateUser (admin sync),
 * and /auth/me (FE reload after refresh). See
 * ai-plans/bugfix-refresh-sync-requires-actor.md for the rationale.
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
import { UserMfaFactorsDal } from "../user_mfa_factors_dal.js";
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
import {
  insertAuthEvent,
  type AuthRequestContext,
} from "../auth-event-logger.js";

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

/**
 * Result of login() when MFA is required.
 * The FE must present the MFA challenge UI and call POST /api/v1/auth/mfa/verify
 * with the challenge token + a TOTP code. No cookies are set in this case.
 */
export interface LoginMfaRequiredResult {
  mfa_required: true;
  mfa_challenge_token: string;
  available_factors: Array<{ factor_id: string; factor_type: string; label: string | null }>;
}

export type LoginOutcome = LoginResult | LoginMfaRequiredResult;

export interface RefreshResult extends LoginResult {}

export interface MeProfileResponse {
  profile: UserProfileDetailDto;
  has_passkey?: boolean;
  auth_method_enforcer_dismissed?: boolean;
  has_mfa?: boolean;
}

// --- Service --------------------------------------------------------------

export class AuthSessionService {
  constructor(
    private pool: Pool,
    private dal: UserProfilesDal,
    private casdoor: CasdoorService,
  ) {}

  // --- Login ---------------------------------------------------------------

  async login(input: LoginBody, request_ctx?: AuthRequestContext): Promise<LoginOutcome> {
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
      // Insert FAILED login auth event (best-effort, non-blocking).
      // No JWT → no resolvable user UUID → user_profile_uuid is null,
      // attempted_username captures the username that was tried.
      await insertAuthEvent({
        pool: this.pool,
        event_type: "login_failed",
        success: false,
        attempted_username: input.username,
        failure_reason: errorText.slice(0, 500),
        request_ctx,
      });
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

    // MFA branch: if MFA is enabled and the user has enrolled factors, mint a
    // challenge token and return mfa_required instead of setting cookies.
    // The Casdoor tokens are stashed server-side (keyed by jti) and released
    // only after the user verifies a TOTP code via POST /api/v1/auth/mfa/verify.
    if (cfg.enable_mfa) {
      // The Casdoor JWT `sub` is the idp_code. Resolve it to the internal
      // user_profiles.uuid before checking MFA factors (same resolution the
      // auth middleware does via resolveInternalUuid).
      const idpCode = claims.sub as string;
      if (idpCode) {
        const { resolveInternalUuid } = await import("../user-profile-repo.js");
        const userUuid = await resolveInternalUuid({
          idp_code: idpCode,
          email: (claims.email as string) ?? null,
          display_name: (claims.displayName as string) ?? (claims.name as string) ?? null,
          idp_org: (claims.owner as string) || undefined,
          idp_username: (claims.name as string) || undefined,
        }, this.pool);

        const { MfaService } = await import("./mfa.service.js");
        const mfaService = new MfaService(this.pool, this.casdoor);
        const hasMfa = await mfaService.hasMfa(userUuid);
        if (hasMfa) {
          const idpOrg = (claims.owner as string) || cfg.casdoor_organization || "";
          const idpUsername = (claims.name as string) || input.username || "";
          const challenge = await mfaService.mintLoginChallenge(
            userUuid,
            idpCode,
            idpOrg,
            idpUsername,
            {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_in: data.expires_in,
            },
          );
          return {
            mfa_required: true,
            mfa_challenge_token: challenge.mfa_challenge_token,
            available_factors: challenge.available_factors,
          };
        }
      }
    }

    // Resolve the user UUID for the SUCCESS login auth event.
    // The Casdoor JWT `sub` is the idp_code — resolve it to the internal
    // user_profiles.uuid (same resolution the auth middleware does).
    const idpCode = claims.sub as string;
    let userUuid: string | undefined;
    if (idpCode) {
      try {
        const { resolveInternalUuid } = await import("../user-profile-repo.js");
        userUuid = await resolveInternalUuid({
          idp_code: idpCode,
          email: (claims.email as string) ?? null,
          display_name: (claims.displayName as string) ?? (claims.name as string) ?? null,
          idp_org: (claims.owner as string) || undefined,
          idp_username: (claims.name as string) || undefined,
        }, this.pool);
      } catch {
        // resolveInternalUuid may throw if the user doesn't exist yet —
        // the auth middleware will JIT-provision on the next authed request.
        // For the auth event, we log with user_profile_uuid = null.
      }
    }

    // Insert SUCCESS login auth event (best-effort, non-blocking).
    await insertAuthEvent({
      pool: this.pool,
      event_type: "login",
      success: true,
      user_profile_uuid: userUuid,
      attempted_username: input.username,
      request_ctx,
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

    // NOTE: /auth/refresh is a pure OAuth token exchange. It must NOT sync the
    // user_profile from Casdoor — that would require a DB write on a PUBLIC
    // route (no authenticated actor → requireActor() throws) and would add an
    // extra Casdoor HTTP call per refresh. Profile freshness is handled by:
    //   - resolveInternalUuid() in the auth middleware (every authed request,
    //     keeps idp_org / idp_username / JIT provisioning fresh)
    //   - UserService.updateUser() (admin-driven explicit Casdoor→Primebrick
    //     sync, sets last_synced_at under an authenticated actor)
    //   - /auth/me (FE reloads the profile after refresh; pure READ)
    // See ai-plans/bugfix-refresh-sync-requires-actor.md for the full rationale.

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

    // Include passkey info for the FE auth method enforcer dialog logic
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

    // Include MFA info for the FE auth method enforcer dialog logic
    let hasMfa = false;
    if (profileId && getAuthConfig().enable_mfa) {
      const mfaDal = new UserMfaFactorsDal(this.pool);
      const mfaCount = await mfaDal.countEnabledByUserProfileId(BigInt(profileId));
      hasMfa = mfaCount > 0;
    }

    return {
      profile,
      has_passkey: hasPasskey,
      auth_method_enforcer_dismissed: authMethodEnforcerDismissed,
      has_mfa: hasMfa,
    };
  }

  /**
   * Dismiss the auth method enforcer dialog for the current user.
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
          "Casdoor™ sync failed",
          502,
          "Failed to sync profile to Casdoor™",
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
