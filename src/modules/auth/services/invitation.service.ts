/**
 * Invitation service — business logic for the user onboarding/welcome flow.
 *
 * Responsibilities:
 *   - Generate invitation tokens (SHA-256 hashed, never stored raw)
 *   - Send invitation emails via NATS → emailsender microservice
 *   - Verify invitation tokens (check status + expiry)
 *   - Send + verify OTP codes (proves email ownership)
 *   - Complete onboarding (set password in Casdoor, mark COMPLETED)
 *   - Revoke / resend invitations
 *   - Generate HMAC-signed alert links for notification emails
 *
 * The service uses `requireActor()` from ALS for audit fields — all methods
 * must be called within an HTTP request context or `runAsSystem()`.
 */

import { logger } from "@primebrick/sdk";
import { createHash, randomBytes, randomInt, createHmac } from "crypto";
import { runAsSystem, requireActor } from "@primebrick/sdk";

import { DomainService } from "../../../db/domain-service.js";
import { field, Filter } from "@primebrick/dal-pg";
import { UserInvitationEntity, type InvitationStatus } from "../user_invitation_entity.js";
import { getConfigEntriesService } from "./config-entries.service.js";
import { CasdoorService } from "./casdoor.service.js";
import { sendEmail } from "./email-sender.js";
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from "../../../http/api-errors.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VerifyResult {
  valid: boolean;
  display_name: string;
  expires_at: string;
}

export interface OtpSendResult {
  sent: boolean;
}

export interface OtpVerifyResult {
  verified: boolean;
}

export interface CompleteResult {
  success: boolean;
}

export interface CreateInvitationResult {
  invitation_uuid: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 10;
const OTP_DIGITS = 6;

// ─── Service ─────────────────────────────────────────────────────────────────

export class InvitationService extends DomainService<Record<string, unknown>> {
  private casdoor: CasdoorService;

  constructor(casdoor: CasdoorService) {
    // The service owns `user_invitations` (absorbed user-invitations-dal.ts).
    super({
      entity: UserInvitationEntity,
      list: {
        searchableKeys: ["email", "status"],
        filterableKeys: new Set(["user_profile_id", "status"]),
        defaultSort: { key: "created_at", dir: "desc" },
      },
    });
    this.casdoor = casdoor;
  }

  // --- user_invitations (absorbed from user-invitations-dal.ts) --------------

  /**
   * Insert a new invitation row.
   * The token_hash is already SHA-256 hashed by the caller — the raw token
   * is NEVER stored in the DB.
   */
  private async insertInvitation(data: {
    user_profile_id: bigint;
    token_hash: string;
    email: string;
    expires_at: Date;
  }): Promise<string> {
    const actor = requireActor();
    const row = await this.dal.add<UserInvitationEntity>(
      UserInvitationEntity,
      {
        user_profile_id: data.user_profile_id,
        token_hash: data.token_hash,
        status: "PENDING" as InvitationStatus,
        email: data.email,
        expires_at: data.expires_at,
        otp_attempts: 0,
        created_by: actor,
        updated_by: actor,
      },
      { actor },
    );
    return row.uuid;
  }

  /**
   * Find an invitation by its token hash.
   * Returns null if not found.
   */
  private async findInvitationByTokenHash(tokenHash: string): Promise<UserInvitationEntity | null> {
    return this.dal.find<UserInvitationEntity, UserInvitationEntity>(
      UserInvitationEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserInvitationEntity, "token_hash" as any), "=", tokenHash),
        ],
        throwIfNotFound: false,
      },
    );
  }

  /**
   * Find an invitation by UUID.
   * Returns null if not found.
   */
  private async findInvitationByUuid(uuid: string): Promise<UserInvitationEntity | null> {
    return this.dal.find<UserInvitationEntity, UserInvitationEntity>(
      UserInvitationEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserInvitationEntity, "uuid" as any), "=", uuid),
        ],
        throwIfNotFound: false,
      },
    );
  }

  /**
   * Find all invitations for a user profile (by user_profile_id).
   * Ordered by created_at descending (most recent first).
   */
  private async findInvitationsByUserProfileId(userProfileId: bigint): Promise<UserInvitationEntity[]> {
    const rows = await this.dal.findAll<UserInvitationEntity, UserInvitationEntity>(
      UserInvitationEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserInvitationEntity, "user_profile_id" as any), "=", userProfileId),
        ],
      },
    );
    return rows as UserInvitationEntity[];
  }

  /**
   * Update the status of an invitation.
   * Also updates the updated_at/updated_by audit fields.
   */
  private async updateInvitationStatus(uuid: string, status: InvitationStatus, extra?: {
    completed_at?: Date;
    otp_hash?: string;
    otp_expires_at?: Date;
    otp_attempts?: number;
    otp_verified_at?: Date;
  }): Promise<void> {
    const actor = requireActor();
    const existing = await this.findInvitationByUuid(uuid);
    if (!existing) return;
    await this.dal.update(
      UserInvitationEntity,
      {
        uuid,
        status,
        ...extra,
        version: existing.version,
      },
      { actor },
    );
  }

  /**
   * Resend — refresh the existing row with a new token hash + expiry and
   * reset status/OTP state to PENDING (no new row: invitations are
   * immutable identity records).
   */
  private async resetInvitationForResend(uuid: string, tokenHash: string, expiresAt: Date): Promise<void> {
    const actor = requireActor();
    const existing = await this.findInvitationByUuid(uuid);
    if (!existing) return;
    await this.dal.update(
      UserInvitationEntity,
      {
        uuid,
        token_hash: tokenHash,
        expires_at: expiresAt,
        status: "PENDING",
        otp_hash: null,
        otp_expires_at: null,
        otp_attempts: 0,
        otp_verified_at: null,
        version: existing.version,
      } as unknown as Partial<UserInvitationEntity>,
      { actor },
    );
  }

  /**
   * Increment the OTP attempt counter.
   * Used when an OTP verification fails — the caller checks the count
   * to decide if max attempts has been reached.
   */
  private async incrementInvitationOtpAttempts(uuid: string): Promise<void> {
    const actor = requireActor();
    const existing = await this.findInvitationByUuid(uuid);
    if (!existing) return;
    await this.dal.update(
      UserInvitationEntity,
      {
        uuid,
        otp_attempts: existing.otp_attempts + 1,
        version: existing.version,
      },
      { actor },
    );
  }

  /**
   * Set the OTP hash and expiry (when sending a new OTP).
   * Resets the attempt counter to 0.
   */
  private async setInvitationOtp(uuid: string, otpHash: string, otpExpiresAt: Date): Promise<void> {
    const actor = requireActor();
    const existing = await this.findInvitationByUuid(uuid);
    if (!existing) return;
    await this.dal.update(
      UserInvitationEntity,
      {
        uuid,
        otp_hash: otpHash,
        otp_expires_at: otpExpiresAt,
        otp_attempts: 0,
        status: "OTP_SENT" as InvitationStatus,
        version: existing.version,
      },
      { actor },
    );
  }

  /**
   * Mark the OTP as verified (sets otp_verified_at).
   */
  private async markInvitationOtpVerified(uuid: string): Promise<void> {
    const actor = requireActor();
    const existing = await this.findInvitationByUuid(uuid);
    if (!existing) return;
    await this.dal.update(
      UserInvitationEntity,
      {
        uuid,
        otp_verified_at: new Date(),
        version: existing.version,
      },
      { actor },
    );
  }

  /**
   * Mark the invitation as completed (sets completed_at + status).
   */
  private async markInvitationCompleted(uuid: string): Promise<void> {
    const actor = requireActor();
    const existing = await this.findInvitationByUuid(uuid);
    if (!existing) return;
    await this.dal.update(
      UserInvitationEntity,
      {
        uuid,
        status: "COMPLETED" as InvitationStatus,
        completed_at: new Date(),
        version: existing.version,
      },
      { actor },
    );
  }

  private get configService() {
    return getConfigEntriesService();
  }

  /**
   * `user_profiles` belongs to `UserService` — resolved dynamically to keep
   * the import graph acyclic (`user.service` statically imports this class).
   */
  private async profiles() {
    return (await import("./user.service.js")).getUserService();
  }

  // ─── Config helpers ────────────────────────────────────────────────────────

  private async getFrontendUrl(): Promise<string> {
    const row = await this.configService.findByKey("frontend_url");
    if (!row || !row.value) {
      throw new Error("[auth] frontend_url is missing in config_entries table");
    }
    return row.value;
  }

  private async getInvitationExpiryDays(): Promise<number> {
    const row = await this.configService.findByKey("invitation_expiry_days");
    if (!row || !row.value) {
      return 7; // default
    }
    const days = parseInt(row.value, 10);
    return isNaN(days) ? 7 : days;
  }

  private async getAdminContactEmail(): Promise<string | null> {
    const row = await this.configService.findByKey("admin_contact_email");
    if (!row || !row.value || row.value.trim() === "") {
      // Fallback: find first admin user's email
      // For now, return null — the email template will omit the mailto: link
      return null;
    }
    return row.value;
  }

  private async getNotificationAlertSecret(): Promise<string> {
    const row = await this.configService.findByKey("notification_alert_secret");
    if (row && row.value && row.value.trim() !== "") {
      return row.value;
    }
    // Auto-generate a 32-byte hex secret. The key row may already exist with
    // an empty value (seeded placeholder) — update it instead of inserting a
    // duplicate, which would violate the unique constraint on `key`.
    const secret = randomBytes(32).toString("hex");
    if (row) {
      await this.configService.updateEntry(row.uuid, { value: secret, version: row.version }, "system");
    } else {
      await this.configService.createEntry(
        { key: "notification_alert_secret", value: secret, type: "secret" },
        "system",
      );
    }
    return secret;
  }

  // ─── Token + OTP generation ────────────────────────────────────────────────

  /**
   * Generate a random invitation token (80 chars: UUID + 32 hex bytes).
   * Returns the raw token — only the SHA-256 hash is stored in the DB.
   */
  private generateToken(): string {
    const uuidPart = crypto.randomUUID();
    const randomPart = randomBytes(32).toString("hex");
    return `${uuidPart}.${randomPart}`;
  }

  /**
   * Hash a token with SHA-256 for safe DB storage.
   */
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  /**
   * Generate a 6-digit OTP code.
   */
  private generateOtp(): string {
    return String(randomInt(100000, 999999));
  }

  /**
   * Hash an OTP code with SHA-256 for safe DB storage.
   */
  private hashOtp(otp: string): string {
    return createHash("sha256").update(otp).digest("hex");
  }

  // ─── Alert link generation ─────────────────────────────────────────────────

  /**
   * Generate a stateless HMAC-signed alert link for notification emails.
   * Format: /login?alert=unauthorized-{type}&token={base64(user_uuid.hmac)}
   */
  async generateAlertLink(userUuid: string, alertType: string): Promise<string> {
    const secret = await this.getNotificationAlertSecret();
    const timestamp = Date.now().toString();
    const payload = `${userUuid}:${alertType}:${timestamp}`;
    const hmac = createHmac("sha256", secret).update(payload).digest("hex");
    const token = Buffer.from(`${userUuid}:${timestamp}:${hmac}`).toString("base64url");
    const frontendUrl = await this.getFrontendUrl();
    return `${frontendUrl}/login?alert=unauthorized-${alertType}&token=${token}`;
  }

  /**
   * Generate a mailto: link for contacting the admin.
   */
  async generateAdminMailto(displayName: string, email: string): Promise<string> {
    const adminEmail = await this.getAdminContactEmail();
    if (!adminEmail) {
      return "";
    }
    const subject = encodeURIComponent("Unauthorized activity on my Primebrick account");
    const body = encodeURIComponent(
      `Hello, I received a notification about a change to my account (${displayName}, ${email}) that I did not make. Please help me secure my account.`,
    );
    return `mailto:${adminEmail}?subject=${subject}&body=${body}`;
  }

  // ─── Public methods ────────────────────────────────────────────────────────

  /**
   * Create an invitation for a user and send the invitation email.
   * Called by UserService.createUser() after the user is created in Casdoor + PG.
   */
  async createInvitation(
    userProfileId: bigint,
    userProfileUuid: string,
    email: string,
    displayName: string,
  ): Promise<CreateInvitationResult> {
    const expiryDays = await this.getInvitationExpiryDays();
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    // Generate token + hash
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);

    // Store invitation in DB — admin context is set by auth middleware
    const invitationUuid = await this.insertInvitation({
      user_profile_id: userProfileId,
      token_hash: tokenHash,
      email,
      expires_at: expiresAt,
    });

    // Send invitation email via NATS → emailsender
    const frontendUrl = await this.getFrontendUrl();
    const welcomeLink = `${frontendUrl}/welcome#token=${token}`;

    await sendEmail({
      template_code: "invitation_welcome",
      language_iso: "en",
      to: [email],
      variables: {
        display_name: displayName,
        welcome_link: welcomeLink,
      },
    });

    return { invitation_uuid: invitationUuid };
  }

  /**
   * Verify an invitation token (PUBLIC endpoint).
   * Returns display_name + expires_at — NEVER the email.
   */
  async verifyToken(token: string): Promise<VerifyResult> {
    const tokenHash = this.hashToken(token);
    const invitation = await this.findInvitationByTokenHash(tokenHash);

    if (!invitation) {
      return { valid: false, display_name: "", expires_at: "" };
    }

    if (invitation.status === "COMPLETED") {
      return { valid: false, display_name: "", expires_at: "" };
    }

    if (invitation.status === "REVOKED") {
      return { valid: false, display_name: "", expires_at: "" };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { valid: false, display_name: "", expires_at: "" };
    }

    // Get user profile for display_name — the invitation stores the
    // internal bigint id, not the profile UUID.
    const profile = await (await this.profiles()).getByUuid(
      await this.getProfileUuidById(invitation.user_profile_id),
    );

    return {
      valid: true,
      display_name: profile?.display_name ?? "",
      expires_at: invitation.expires_at.toISOString(),
    };
  }

  /**
   * Helper: get a user profile's UUID by its internal bigint ID.
   */
  private async getProfileUuidById(profileId: bigint): Promise<string> {
    const uuid = await (await this.profiles()).getUuidById(profileId);
    if (!uuid) {
      throw new NotFoundError("User profile not found for invitation");
    }
    return uuid;
  }

  /**
   * Send an OTP code to the invitation's email address (PUBLIC endpoint).
   */
  async sendOtp(token: string): Promise<OtpSendResult> {
    const tokenHash = this.hashToken(token);
    const invitation = await this.findInvitationByTokenHash(tokenHash);

    if (!invitation) {
      return { sent: false };
    }

    if (invitation.status === "COMPLETED" || invitation.status === "REVOKED") {
      return { sent: false };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { sent: false };
    }

    // Generate OTP
    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP hash in DB — public endpoint, use system actor
    await runAsSystem(() =>
      this.setInvitationOtp(invitation.uuid, otpHash, otpExpiresAt),
    );

    // Get display_name for the email
    const profileUuid = await this.getProfileUuidById(invitation.user_profile_id);
    const profile = await (await this.profiles()).getByUuid(profileUuid);

    // Send OTP email via NATS → emailsender
    await sendEmail({
      template_code: "otp_verification",
      language_iso: "en",
      to: [invitation.email],
      variables: {
        display_name: profile?.display_name ?? "",
        otp_code: otp,
      },
    });

    return { sent: true };
  }

  /**
   * Verify an OTP code (PUBLIC endpoint).
   */
  async verifyOtp(token: string, otpCode: string): Promise<OtpVerifyResult> {
    const tokenHash = this.hashToken(token);
    const invitation = await this.findInvitationByTokenHash(tokenHash);

    if (!invitation) {
      return { verified: false };
    }

    if (invitation.status === "COMPLETED" || invitation.status === "REVOKED") {
      return { verified: false };
    }

    if (!invitation.otp_hash || !invitation.otp_expires_at) {
      return { verified: false };
    }

    // Check OTP expiry
    if (new Date(invitation.otp_expires_at) < new Date()) {
      return { verified: false };
    }

    // Check max attempts
    if (invitation.otp_attempts >= OTP_MAX_ATTEMPTS) {
      return { verified: false };
    }

    // Verify OTP hash
    const providedHash = this.hashOtp(otpCode);
    if (providedHash !== invitation.otp_hash) {
      // Increment failed attempts — public endpoint, use system actor
      await runAsSystem(() =>
        this.incrementInvitationOtpAttempts(invitation.uuid),
      );
      return { verified: false };
    }

    // OTP verified — mark it
    await runAsSystem(() =>
      this.markInvitationOtpVerified(invitation.uuid),
    );

    return { verified: true };
  }

  /**
   * Complete onboarding — set password in Casdoor + mark invitation COMPLETED
   * + send notification email (PUBLIC endpoint).
   */
  async completeInvitation(
    token: string,
    otpCode: string,
    newPassword: string,
  ): Promise<CompleteResult> {
    const tokenHash = this.hashToken(token);
    const invitation = await this.findInvitationByTokenHash(tokenHash);

    if (!invitation) {
      throw new ValidationError("Invalid or expired invitation token");
    }

    if (invitation.status === "COMPLETED") {
      throw new ValidationError("This invitation has already been used", {
        internal_code: "INVITATION_ALREADY_COMPLETED",
      });
    }

    if (invitation.status === "REVOKED") {
      throw new ValidationError("This invitation has been revoked", {
        internal_code: "INVITATION_REVOKED",
      });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new ValidationError("This invitation has expired", {
        internal_code: "INVITATION_EXPIRED",
      });
    }

    // Verify OTP
    if (!invitation.otp_verified_at) {
      throw new ValidationError("OTP verification required before setting password", {
        internal_code: "OTP_NOT_VERIFIED",
      });
    }

    // Verify OTP code matches (additional check — the FE should only call this
    // after verifyOtp returned true, but we verify again for security)
    if (!invitation.otp_hash || !invitation.otp_expires_at) {
      throw new ValidationError("OTP not sent");
    }

    if (new Date(invitation.otp_expires_at) < new Date()) {
      throw new ValidationError("OTP has expired", {
        internal_code: "OTP_EXPIRED",
      });
    }

    const providedHash = this.hashOtp(otpCode);
    if (providedHash !== invitation.otp_hash) {
      throw new ValidationError("Invalid OTP code", {
        internal_code: "OTP_INVALID",
      });
    }

    // Get user profile
    const profileUuid = await this.getProfileUuidById(invitation.user_profile_id);
    const profile = await (await this.profiles()).getByUuid(profileUuid);
    if (!profile) {
      throw new NotFoundError("User profile not found");
    }

    // Set password in Casdoor
    // The profile has idp_org + idp_username which Casdoor needs
    const idpOrg = profile.idp_org;
    const idpUsername = profile.idp_username;
    if (!idpOrg || !idpUsername) {
      throw new Error("[auth] User profile missing idp_org or idp_username — cannot set password in Casdoor");
    }

    const cdClient = await this.casdoor.getClient();
    if (!cdClient) {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ client unavailable",
        502,
        "Cannot set password: Casdoor™ is not configured or unreachable",
        { internal_code: "CASDOOR_UNAVAILABLE", severity: "HIGH" },
      );
    }

    const result = await cdClient.changePassword(
      { id: profile.idp_code, owner: idpOrg, name: idpUsername },
      newPassword,
    );

    if (result.status !== "ok") {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ password change failed",
        502,
        result.msg || "Casdoor™ returned an error while setting the password",
        { internal_code: "CASDOOR_SET_PASSWORD_FAILED", severity: "HIGH" },
      );
    }

    // Mark invitation as completed — public endpoint, use system actor
    await runAsSystem(() =>
      this.markInvitationCompleted(invitation.uuid),
    );

    // Mark onboarding_completed on user_profile
    await runAsSystem(async () =>
      (await this.profiles()).updateProfileById(invitation.user_profile_id, { onboarding_completed: true }),
    );

    // Send notification email
    const alertLink = await this.generateAlertLink(profile.uuid, "password-change");
    const adminMailto = await this.generateAdminMailto(
      profile.display_name ?? "",
      invitation.email,
    );

    await sendEmail({
      template_code: "password_changed",
      language_iso: "en",
      to: [invitation.email],
      variables: {
        display_name: profile.display_name ?? "",
        alert_link: alertLink,
        admin_mailto: adminMailto,
      },
    });

    return { success: true };
  }

  /**
   * Revoke an invitation (admin endpoint).
   */
  async revokeInvitation(invitationUuid: string): Promise<void> {
    const invitation = await this.findInvitationByUuid(invitationUuid);
    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.status === "COMPLETED") {
      throw new ValidationError("Cannot revoke a completed invitation", {
        internal_code: "INVITATION_ALREADY_COMPLETED",
      });
    }

    // Admin endpoint — auth middleware has set the session
    await this.updateInvitationStatus(invitationUuid, "REVOKED");
  }

  /**
   * Resend an invitation — generates a new token and sends a new email.
   */
  async resendInvitation(invitationUuid: string): Promise<void> {
    const invitation = await this.findInvitationByUuid(invitationUuid);
    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.status === "COMPLETED") {
      throw new ValidationError("Cannot resend a completed invitation", {
        internal_code: "INVITATION_ALREADY_COMPLETED",
      });
    }

    // Get user profile for display_name
    const profileUuid = await this.getProfileUuidById(invitation.user_profile_id);
    const profile = await (await this.profiles()).getByUuid(profileUuid);
    if (!profile) {
      throw new NotFoundError("User profile not found");
    }

    // Generate new token
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiryDays = await this.getInvitationExpiryDays();
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    // Update the existing invitation with the new token hash + expiry
    // (we don't create a new row — we refresh the existing one).
    // Admin endpoint — requireActor() resolves the admin UUID for audit stamps.
    await this.resetInvitationForResend(invitationUuid, tokenHash, expiresAt);

    // Send new invitation email
    const frontendUrl = await this.getFrontendUrl();
    const welcomeLink = `${frontendUrl}/welcome#token=${token}`;

    await sendEmail({
      template_code: "invitation_welcome",
      language_iso: "en",
      to: [invitation.email],
      variables: {
        display_name: profile.display_name ?? "",
        welcome_link: welcomeLink,
      },
    });
  }

  /**
   * Process a login alert — user clicked "if this wasn't you" link.
   * Sends an admin alert email. (PUBLIC endpoint, HMAC-verified)
   */
  async processLoginAlert(alertType: string, token: string): Promise<void> {
    const secret = await this.getNotificationAlertSecret();

    // Decode token
    let decoded: string;
    try {
      decoded = Buffer.from(token, "base64url").toString("utf-8");
    } catch {
      // Invalid token — silently return (don't leak info)
      return;
    }

    const parts = decoded.split(":");
    if (parts.length !== 3) {
      return;
    }

    const [userUuid, timestamp, hmac] = parts;
    const payload = `${userUuid}:unauthorized-${alertType}:${timestamp}`;

    // Verify HMAC
    const expectedHmac = createHmac("sha256", secret).update(payload).digest("hex");
    if (hmac !== expectedHmac) {
      // Invalid HMAC — silently return
      return;
    }

    // Look up the user
    const profile = await (await this.profiles()).getByUuid(userUuid);
    if (!profile) {
      return;
    }

    // Get admin email
    const adminEmail = await this.getAdminContactEmail();
    if (!adminEmail) {
      logger.warn("No admin contact email configured — cannot send alert", { tags: ["auth"] });
      return;
    }

    // Send alert email to admin
    await sendEmail({
      template_code: "admin_unauthorized_alert",
      language_iso: "en",
      to: [adminEmail],
      variables: {
        user_display_name: profile.display_name ?? "",
        user_email: profile.email ?? "",
        alert_type: alertType,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
