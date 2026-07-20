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

import type { Pool } from "pg";
import { createHash, randomBytes, randomInt, createHmac } from "crypto";
import { runAsSystem, requireActor } from "@primebrick/sdk";

import { UserInvitationsDal } from "../user-invitations-dal.js";
import { UserProfilesDal } from "../user-profiles-dal.js";
import { AuthConfigurationsDal } from "../auth_configurations_dal.js";
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

export class InvitationService {
  private pool: Pool;
  private invitationsDal: UserInvitationsDal;
  private profilesDal: UserProfilesDal;
  private configDal: AuthConfigurationsDal;
  private casdoor: CasdoorService;

  constructor(pool: Pool, casdoor: CasdoorService) {
    this.pool = pool;
    this.invitationsDal = new UserInvitationsDal(pool);
    this.profilesDal = new UserProfilesDal(pool);
    this.configDal = new AuthConfigurationsDal(pool);
    this.casdoor = casdoor;
  }

  // ─── Config helpers ────────────────────────────────────────────────────────

  private async getFrontendUrl(): Promise<string> {
    const row = await this.configDal.findByKey("frontend_url");
    if (!row || !row.value) {
      throw new Error("[auth] frontend_url is missing in auth_configurations table");
    }
    return row.value;
  }

  private async getInvitationExpiryDays(): Promise<number> {
    const row = await this.configDal.findByKey("invitation_expiry_days");
    if (!row || !row.value) {
      return 7; // default
    }
    const days = parseInt(row.value, 10);
    return isNaN(days) ? 7 : days;
  }

  private async getAdminContactEmail(): Promise<string | null> {
    const row = await this.configDal.findByKey("admin_contact_email");
    if (!row || !row.value || row.value.trim() === "") {
      // Fallback: find first admin user's email
      // For now, return null — the email template will omit the mailto: link
      return null;
    }
    return row.value;
  }

  private async getNotificationAlertSecret(): Promise<string> {
    let row = await this.configDal.findByKey("notification_alert_secret");
    if (!row || !row.value || row.value.trim() === "") {
      // Auto-generate a 32-byte hex secret
      const secret = randomBytes(32).toString("hex");
      await this.configDal.upsert("notification_alert_secret", secret, "system");
      return secret;
    }
    return row.value;
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
    const invitationUuid = await this.invitationsDal.create({
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
    const invitation = await this.invitationsDal.findByTokenHash(tokenHash);

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

    // Get user profile for display_name
    const profile = await this.profilesDal.getByUuid(
      // We need the user_profile_id to look up — but getByUuid takes a UUID string.
      // The invitation has user_profile_id (bigint), not the profile UUID.
      // We need a helper to get profile by id.
      // For now, we'll query the profile by its internal id.
      // The profilesDal doesn't have a getById method, so we'll use a raw query.
      // Actually, let's add a method or use the pool directly.
      // Let's use the pool for a simple query.
      (await this.getProfileUuidById(invitation.user_profile_id)),
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
    const result = await this.pool.query(
      `SELECT uuid FROM user_profiles WHERE id = $1`,
      [profileId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundError("User profile not found for invitation");
    }
    return result.rows[0].uuid;
  }

  /**
   * Send an OTP code to the invitation's email address (PUBLIC endpoint).
   */
  async sendOtp(token: string): Promise<OtpSendResult> {
    const tokenHash = this.hashToken(token);
    const invitation = await this.invitationsDal.findByTokenHash(tokenHash);

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
      this.invitationsDal.setOtp(invitation.uuid, otpHash, otpExpiresAt),
    );

    // Get display_name for the email
    const profileUuid = await this.getProfileUuidById(invitation.user_profile_id);
    const profile = await this.profilesDal.getByUuid(profileUuid);

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
    const invitation = await this.invitationsDal.findByTokenHash(tokenHash);

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
        this.invitationsDal.incrementOtpAttempts(invitation.uuid),
      );
      return { verified: false };
    }

    // OTP verified — mark it
    await runAsSystem(() =>
      this.invitationsDal.markOtpVerified(invitation.uuid),
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
    const invitation = await this.invitationsDal.findByTokenHash(tokenHash);

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
    const profile = await this.profilesDal.getByUuid(profileUuid);
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
        "Casdoor client unavailable",
        502,
        "Cannot set password: Casdoor is not configured or unreachable",
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
        "Casdoor password change failed",
        502,
        result.msg || "Casdoor returned an error while setting the password",
        { internal_code: "CASDOOR_SET_PASSWORD_FAILED", severity: "HIGH" },
      );
    }

    // Mark invitation as completed — public endpoint, use system actor
    await runAsSystem(() =>
      this.invitationsDal.markCompleted(invitation.uuid),
    );

    // Mark onboarding_completed on user_profile
    await this.pool.query(
      `UPDATE user_profiles SET onboarding_completed = true, updated_at = now(), updated_by = $1 WHERE id = $2`,
      ["system", invitation.user_profile_id],
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
    const invitation = await this.invitationsDal.findByUuid(invitationUuid);
    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.status === "COMPLETED") {
      throw new ValidationError("Cannot revoke a completed invitation", {
        internal_code: "INVITATION_ALREADY_COMPLETED",
      });
    }

    // Admin endpoint — auth middleware has set the session
    await this.invitationsDal.updateStatus(invitationUuid, "REVOKED");
  }

  /**
   * Resend an invitation — generates a new token and sends a new email.
   */
  async resendInvitation(invitationUuid: string): Promise<void> {
    const invitation = await this.invitationsDal.findByUuid(invitationUuid);
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
    const profile = await this.profilesDal.getByUuid(profileUuid);
    if (!profile) {
      throw new NotFoundError("User profile not found");
    }

    // Generate new token
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiryDays = await this.getInvitationExpiryDays();
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    // Update the existing invitation with the new token hash + expiry
    // (we don't create a new row — we refresh the existing one)
    // Admin endpoint — auth middleware has set the session, requireActor() returns admin UUID
    const actor = requireActor();

    // Direct query to update token_hash + expires_at (the DAL doesn't have this method)
    await this.pool.query(
      `UPDATE user_invitations SET token_hash = $1, expires_at = $2, status = 'PENDING', otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0, otp_verified_at = NULL, updated_at = now(), updated_by = $3 WHERE uuid = $4`,
      [tokenHash, expiresAt, actor, invitationUuid],
    );

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
    const profile = await this.profilesDal.getByUuid(userUuid);
    if (!profile) {
      return;
    }

    // Get admin email
    const adminEmail = await this.getAdminContactEmail();
    if (!adminEmail) {
      console.warn("[auth] No admin contact email configured — cannot send alert");
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
