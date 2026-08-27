/**
 * UserService — business logic for admin user management.
 *
 * Owns the create / update / delete flows that coordinate Casdoor + the local
 * `user_profiles` table. The service is request-context-free: it takes plain
 * parameters and reads the actor from ALS (`requireActor()`) when it needs the
 * authenticated user for audit columns. It never touches `req`/`res`.
 *
 * Errors are thrown as `ApiError` subclasses so the centralized `errorHandler`
 * can convert them to RFC 7807 JSON. This removes the dozens of inline
 * `res.status(...).json({...})` blocks that used to live in the router.
 */

import { randomUUID, randomBytes } from "node:crypto";
import type { Pool } from "pg";

import { UserProfilesDal, type UserListQuery, type UserListResponse } from "../user-profiles-dal.js";
import { CasdoorService } from "./casdoor.service.js";
import { InvitationService } from "./invitation.service.js";
import { sendEmail } from "./email-sender.js";
import { getAuthConfig } from "../config.js";
import { requireActor } from "@primebrick/sdk";
import { ApiError, NotFoundError, ValidationError } from "../../../http/api-errors.js";
import type { CreateUserBody, UpdateUserBody, UserUpdateBody } from "../dto.js";
import type { UserProfileDetailDto } from "../user-profiles-dal.js";

/**
 * Result of a user creation: the local profile DTO plus the resolved IDP
 * identifiers (useful for logging / debugging on the controller side).
 */
export interface CreateUserResult {
  profile: UserProfileDetailDto;
  invitation_uuid?: string;
}

export class UserService {
  constructor(
    private pool: Pool,
    private dal: UserProfilesDal,
    private casdoor: CasdoorService,
  ) {}

  // --- Create ---------------------------------------------------------------

  async createUser(input: CreateUserBody): Promise<CreateUserResult> {
    const actor = requireActor();
    const { username, password, display_name, email, roles, avatar_initials, avatar_color, idp_org, is_active, is_admin, is_verified, email_verified, send_invitation } = input;

    const defaultColor = avatar_color || "#4f46e5";
    const calculatedInitials = avatar_initials || computeInitials(display_name);

    // 1. Create in Casdoor (if configured)
    const cdClient = await this.casdoor.getClient();
    const cfg = await getAuthConfig();
    let casdoorUserId: string | null = null;
    let idpOrg = idp_org || cfg.idp_organization!;
    let idpUsername = username;

    if (cdClient) {
      const { generateHexagonAvatarSvg } = await import("../avatar-svg-generator.js");
      const svgDataUri = generateHexagonAvatarSvg(calculatedInitials, defaultColor);

      const newUser = await cdClient.addUser({
        owner: idpOrg,
        name: username,
        displayName: display_name,
        email,
        // When send_invitation is true, password is optional — Casdoor will
        // create the user without a password, and the user will set it via
        // the welcome page. We pass a random placeholder if no password is
        // provided, because Casdoor requires a non-empty password field.
        password: password || (send_invitation ? randomBytes(16).toString("hex") : undefined),
        roles: (roles || []).map((r) => ({ name: r })),
        customFields: {
          app_avatar_color: defaultColor,
          app_avatar_shape: "hexagon",
          app_avatar_letters: calculatedInitials,
        },
        avatar: svgDataUri,
        isForbidden: !is_active,
        isAdmin: is_admin,
        isVerified: is_verified,
        emailVerified: email_verified,
      });
      if (!newUser || !newUser.id) {
        throw new ApiError(
          "/errors/internal-error",
          "Failed to create user",
          500,
          "Casdoor™ user creation did not return a UUID",
          { internal_code: "USER_CREATE_FAILED", severity: "HIGH" },
        );
      }
      casdoorUserId = newUser.id;
      idpOrg = newUser.owner || cfg.idp_organization!;
      idpUsername = newUser.name || username;
    }

    // 2. Create local profile via DAL (repo.add — no manual audit field setting)
    const idpCode = casdoorUserId;
    const newUuid = randomUUID();
    const issuer = cfg.idp_endpoint || null;

    await this.dal.createProfile({
      uuid: newUuid,
      idp_code: idpCode,
      email,
      display_name,
      idp_org: idpOrg,
      idp_username: idpUsername,
      avatar_color: defaultColor,
      avatar_initials: calculatedInitials,
      is_active,
      is_admin,
      is_verified,
      email_verified,
      issuer,
      roles: roles ?? null,
      last_synced_at: new Date(),
    });

    const profile = await this.dal.getByUuid(newUuid);
    if (!profile) {
      // Should never happen — we just inserted it.
      throw new ApiError(
        "/errors/internal-error",
        "Failed to create user",
        500,
        "Local profile was not found after insert",
        { internal_code: "USER_CREATE_FAILED", severity: "HIGH" },
      );
    }

    // 3. Create invitation if send_invitation is true
    let invitation_uuid: string | undefined;
    if (send_invitation) {
      // Get the internal bigint id of the profile (not exposed in the DTO)
      const idResult = await this.pool.query(
        `SELECT id FROM user_profiles WHERE uuid = $1`,
        [newUuid],
      );
      const profileId = idResult.rows[0]?.id;
      if (!profileId) {
        throw new ApiError(
          "/errors/internal-error",
          "Failed to create invitation",
          500,
          "Could not resolve user profile id after insert",
          { internal_code: "INVITATION_CREATE_FAILED", severity: "HIGH" },
        );
      }

      const invitationService = new InvitationService(this.pool, this.casdoor);
      const result = await invitationService.createInvitation(
        BigInt(profileId),
        profile.uuid,
        email,
        display_name,
      );
      invitation_uuid = result.invitation_uuid;
    }

    return { profile, invitation_uuid };
  }

  // --- Update ---------------------------------------------------------------

  async updateUser(uuid: string, body: UpdateUserBody): Promise<UserProfileDetailDto> {
    const updateBody: Record<string, unknown> = {};
    if (body.display_name !== undefined) updateBody.display_name = body.display_name;
    if (body.email !== undefined) updateBody.email = body.email;
    if (body.avatar_color !== undefined) updateBody.avatar_color = body.avatar_color;
    if (body.is_active !== undefined) updateBody.is_active = body.is_active;
    if (body.is_admin !== undefined) updateBody.is_admin = body.is_admin;
    if (body.is_verified !== undefined) updateBody.is_verified = body.is_verified;
    if (body.email_verified !== undefined) updateBody.email_verified = body.email_verified;
    if (body.roles !== undefined) updateBody.roles = JSON.stringify(body.roles);

    if (Object.keys(updateBody).length === 0) {
      throw new ValidationError("No fields to update", { internal_code: "NO_FIELDS" });
    }

    const existing = await this.dal.getByUuid(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    // Sync to Casdoor first (non-best-effort: fail if sync fails)
    const cdClient = await this.casdoor.getClient();
    if (cdClient) {
      const casdoorUpdate: Record<string, unknown> = {
        id: existing.idp_code,
        owner: existing.idp_org || undefined,
        name: existing.idp_username || undefined,
      };
      if (body.display_name !== undefined) casdoorUpdate.displayName = body.display_name;
      if (body.email !== undefined) casdoorUpdate.email = body.email;
      if (body.is_active !== undefined) casdoorUpdate.isForbidden = !body.is_active;
      if (body.is_admin !== undefined) casdoorUpdate.isAdmin = body.is_admin;
      if (body.is_verified !== undefined) casdoorUpdate.isVerified = body.is_verified;
      if (body.email_verified !== undefined) casdoorUpdate.emailVerified = body.email_verified;

      const syncSuccess = await cdClient.updateUser(casdoorUpdate as any);
      if (!syncSuccess) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor™ sync failed",
          502,
          "Failed to sync user to Casdoor™",
          {
            instance: "/api/v1/auth/users/:uuid",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
            extra: {
              issues: {
                error_details: "Casdoor API returned non-success status",
                casdoor_user_id: existing.idp_code,
                attempted_fields: Object.keys(updateBody),
              },
            },
          },
        );
      }
    }

    // Casdoor sync succeeded (or skipped) → update local DB with last_synced_at
    updateBody.last_synced_at = new Date();
    await this.dal.updateProfile(uuid, updateBody as any);

    const updated = await this.dal.getByUuid(uuid);
    if (!updated) {
      throw new NotFoundError("User profile not found after update", { internal_code: "USER_NOT_FOUND" });
    }
    return updated;
  }

  // --- Delete (soft) --------------------------------------------------------

  async deleteUser(uuid: string): Promise<void> {
    const existing = await this.dal.getByUuid(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    // Soft delete in local DB
    await this.dal.softDelete(uuid);

    // Disable in Casdoor (best-effort, non-critical)
    try {
      const cdClient = await this.casdoor.getClient();
      if (cdClient) {
        await cdClient.updateUser({
          id: existing.idp_code,
          owner: existing.idp_org || undefined,
          name: existing.idp_username || undefined,
          isForbidden: true,
        } as any);
      }
    } catch (syncError) {
      // Non-critical: local soft-delete already succeeded.
      console.error("[UserService] Casdoor disable failed (non-critical):", syncError);
    }
  }

  // --- Restore (un-soft-delete) --------------------------------------------

  async restoreUser(uuid: string): Promise<void> {
    const existing = await this.dal.getByUuid(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    await this.dal.restore(uuid);

    // Re-enable in Casdoor (best-effort, non-critical).
    try {
      const cdClient = await this.casdoor.getClient();
      if (cdClient) {
        await cdClient.updateUser({
          id: existing.idp_code,
          owner: existing.idp_org || undefined,
          name: existing.idp_username || undefined,
          isForbidden: false,
        } as any);
      }
    } catch (syncError) {
      console.error("[UserService] Casdoor re-enable failed (non-critical):", syncError);
    }
  }

  // --- Entity CRUD (admin surface) -----------------------------------------

  async listUsers(query: UserListQuery): Promise<UserListResponse> {
    return this.dal.listUsers(query);
  }

  async getUserByUuid(uuid: string): Promise<UserProfileDetailDto> {
    const user = await this.dal.getByUuid(uuid);
    if (!user) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }
    return user;
  }

  async getUserProfileAudit(uuid: string, page: number, limit: number) {
    return this.dal.getUserProfileAudit(uuid, page, limit);
  }

  /**
   * Admin-side profile update (`PUT /api/v1/entities/user_profiles/:uuid`).
   * Syncs display_name / email / avatar / roles to Casdoor first (non-best-
   * effort), then updates the local DB.
   */
  async updateUserProfile(uuid: string, body: UserUpdateBody): Promise<UserProfileDetailDto> {
    const profile = await this.dal.getByUuid(uuid);
    if (!profile) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    const cdClient = await this.casdoor.getClient();
    const syncTimestamp = new Date();
    if (cdClient) {
      let svgDataUri: string | undefined;
      if (body.avatar_color && body.avatar_initials) {
        const { generateHexagonAvatarSvg } = await import("../avatar-svg-generator.js");
        svgDataUri = generateHexagonAvatarSvg(body.avatar_initials, body.avatar_color);
      }

      const syncSuccess = await cdClient.updateUser({
        id: profile.idp_code,
        owner: profile.idp_org || undefined,
        name: profile.idp_username || undefined,
        displayName: body.display_name || profile.display_name,
        email: body.email || profile.email,
        customFields: {
          app_avatar_color: body.avatar_color || profile.avatar_color,
          app_avatar_shape: "hexagon",
          app_avatar_letters: body.avatar_initials || profile.avatar_initials,
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
            instance: "/api/v1/entities/user_profiles/:uuid",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          },
        );
      }
    }

    const updateBody: Record<string, unknown> = { last_synced_at: syncTimestamp };
    if (body.display_name !== undefined) updateBody.display_name = body.display_name;
    if (body.email !== undefined) updateBody.email = body.email || undefined;
    if (body.avatar_color !== undefined) updateBody.avatar_color = body.avatar_color;
    if (body.avatar_initials !== undefined) updateBody.avatar_initials = body.avatar_initials;
    if (body.roles !== undefined) updateBody.roles = JSON.stringify(body.roles);

    await this.dal.updateProfile(uuid, updateBody as any);

    const updated = await this.dal.getByUuid(uuid);
    if (!updated) {
      throw new NotFoundError("User profile not found after update", { internal_code: "USER_NOT_FOUND" });
    }
    return updated;
  }

  // --- Password change ------------------------------------------------------

  /**
   * Change a user's password in Casdoor.
   * Returns the raw Casdoor response so the router can check `status === "ok"`.
   * Throws ApiError if the user is not found or Casdoor is unreachable.
   */
  async changePassword(uuid: string, newPassword: string): Promise<{ status: string; success?: boolean; msg?: string }> {
    const existing = await this.dal.getByUuid(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    const cdClient = await this.casdoor.getClient();
    if (!cdClient) {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ client unavailable",
        502,
        "Cannot change password: Casdoor™ is not configured or unreachable",
        { internal_code: "CASDOOR_UNAVAILABLE", severity: "HIGH" },
      );
    }

    const result = await cdClient.changePassword(
      { id: existing.idp_code, owner: existing.idp_org || undefined, name: existing.idp_username || undefined },
      newPassword,
    );

    if (result.status !== "ok") {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ password change failed",
        502,
        result.msg || "Casdoor™ returned an error",
        { internal_code: "CASDOOR_PASSWORD_CHANGE_FAILED", severity: "HIGH" },
      );
    }

    // Send password_changed notification email (best-effort)
    if (existing.email) {
      try {
        const invitationService = new InvitationService(this.pool, this.casdoor);
        const alertLink = await invitationService.generateAlertLink(existing.uuid, "password-change");
        const adminMailto = await invitationService.generateAdminMailto(
          existing.display_name ?? "",
          existing.email ?? "",
        );
        await sendEmail({
          template_code: "password_changed",
          language_iso: "en",
          to: [existing.email],
          variables: {
            display_name: existing.display_name ?? "",
            alert_link: alertLink,
            admin_mailto: adminMailto,
          },
        });
      } catch (emailErr) {
        console.error("[UserService] Failed to send password_changed email:", emailErr);
      }
    }

    return result;
  }

  /**
   * Self-service password change for the authenticated user.
   * Verifies the current password against Casdoor before allowing the change.
   * Sends a `password_changed` notification email on success.
   */
  async changeOwnPassword(
    userProfileUuid: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ status: string; success?: boolean; msg?: string }> {
    const existing = await this.dal.getByUuid(userProfileUuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    const cdClient = await this.casdoor.getClient();
    if (!cdClient) {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ client unavailable",
        502,
        "Cannot change password: Casdoor™ is not configured or unreachable",
        { internal_code: "CASDOOR_UNAVAILABLE", severity: "HIGH" },
      );
    }

    // Step 1: verify current password
    const checkResult = await cdClient.checkUserPassword(
      { id: existing.idp_code, owner: existing.idp_org || undefined, name: existing.idp_username || undefined },
      currentPassword,
    );

    if (checkResult.status !== "ok") {
      throw new ApiError(
        "/errors/wrong-password",
        "Current password is incorrect",
        400,
        "The current password verification failed",
        { internal_code: "WRONG_PASSWORD", severity: "LOW" },
      );
    }

    // Step 2: change the password
    const result = await cdClient.changePassword(
      { id: existing.idp_code, owner: existing.idp_org || undefined, name: existing.idp_username || undefined },
      newPassword,
    );

    if (result.status !== "ok") {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ password change failed",
        502,
        result.msg || "Casdoor™ returned an error",
        { internal_code: "CASDOOR_PASSWORD_CHANGE_FAILED", severity: "HIGH" },
      );
    }

    // Step 3: send notification email (best-effort)
    if (existing.email) {
      try {
        const invitationService = new InvitationService(this.pool, this.casdoor);
        const alertLink = await invitationService.generateAlertLink(existing.uuid, "password-change");
        const adminMailto = await invitationService.generateAdminMailto(
          existing.display_name ?? "",
          existing.email ?? "",
        );
        await sendEmail({
          template_code: "password_changed",
          language_iso: "en",
          to: [existing.email],
          variables: {
            display_name: existing.display_name ?? "",
            alert_link: alertLink,
            admin_mailto: adminMailto,
          },
        });
      } catch (emailErr) {
        console.error("[UserService] Failed to send password_changed email:", emailErr);
      }
    }

    return result;
  }

  // --- Availability checks --------------------------------------------------

  /**
   * Check whether an email is already in use. Returns the existing user's UUID
   * when taken, or `null` when available.
   */
  async checkEmailAvailability(email: string): Promise<{ available: boolean; existingUuid?: string }> {
    const existing = await this.dal.getByEmail(email);
    if (existing) {
      return { available: false, existingUuid: existing.uuid };
    }
    return { available: true };
  }

  /**
   * Check whether a username is already taken within an org (org-scoped
   * uniqueness, matching Casdoor's idp_owner/idp_name model). Also checks
   * Casdoor directly to catch users synced from Casdoor but not yet in the
   * local DB.
   */
  async checkUsernameAvailability(
    username: string,
    idpOrg: string,
  ): Promise<{ available: boolean; existingUuid?: string; existsInCasdoor?: boolean }> {
    const result = await this.dal.listUsers({
      filters: [
        { field: "idp_username", op: "=", value: username },
        { field: "idp_org", op: "=", value: idpOrg },
      ],
      connector: "AND",
      page: 1,
      page_size: 1,
      deleted_records: "EXCLUDED",
    });

    if (result.rows.length > 0) {
      return { available: false, existingUuid: result.rows[0]!.uuid };
    }

    // Check Casdoor for users not yet provisioned locally.
    const cdClient = await this.casdoor.getClient();
    if (cdClient) {
      const casdoorQueryId = `${idpOrg}/${username}`;
      const casdoorUser = await cdClient.getUser(casdoorQueryId);
      if (casdoorUser) {
        return { available: false, existsInCasdoor: true };
      }
    }

    return { available: true };
  }
}

// --- helpers ---------------------------------------------------------------

/** Compute 1-2 letter initials from a display name. Pure function, no I/O. */
export function computeInitials(displayName?: string): string {
  if (!displayName) return "??";
  const words = displayName.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return "??";
  const firstLetter = words[0]![0]!.toUpperCase();
  if (words.length > 1) {
    const lastLetter = words[words.length - 1]![0]!.toUpperCase();
    return firstLetter + lastLetter;
  }
  return words[0]!.slice(0, 2).toUpperCase() || firstLetter;
}
