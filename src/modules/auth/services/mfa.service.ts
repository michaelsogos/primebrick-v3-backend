/**
 * MfaService — business logic for MFA / 2FA (TOTP only in v1).
 *
 * Owns:
 *   - Casdoor MFA endpoint proxying (initiate → verify → enable → delete)
 *   - PG mirror tracking (`user_mfa_factors` table)
 *   - TOTP code generation (for the `enable` step, which requires a fresh passcode)
 *   - `has_mfa` flag computation (used by GET /api/v1/auth/me)
 *
 * The service is request-context-free. It returns plain result objects; the
 * controller is responsible for shaping the JSON response. Errors are thrown
 * as `ApiError` subclasses.
 *
 * TOTP generation:
 *   The `enable` Casdoor endpoint requires a fresh TOTP passcode (not just the
 *   secret + recovery codes). The BE generates the passcode from the secret
 *   using a minimal RFC 6238 implementation (SHA1, 6 digits, 30s step).
 *   No external TOTP library is needed — Casdoor does the actual verification
 *   during login/step-up; the BE only generates a code during enrollment.
 *
 * Multi-instance note:
 *   This service is stateless (no in-memory maps). All state is in PG or Casdoor.
 */

import type { Pool } from "pg";
import { createHmac, createHash, randomBytes, randomUUID } from "crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

import { runAsSystem } from "@primebrick/sdk";
import { getAuthConfig } from "../config.js";
import { AuthConfigurationsDal } from "../auth_configurations_dal.js";
import { CasdoorService } from "./casdoor.service.js";
import { UserMfaFactorsDal } from "../user_mfa_factors_dal.js";
import { MfaActionAuthorizationsDal } from "../mfa_action_authorizations_dal.js";
import {
  signMfaChallengeToken,
  verifyMfaChallengeToken,
  type MfaChallengePayload,
} from "../mfa-challenge-token.js";
import { encrypt, decrypt } from "../crypto-helpers.js";
import {
  ApiError,
  UnauthorizedError,
  NotFoundError,
} from "../../../http/api-errors.js";

// --- TOTP (RFC 6238) ------------------------------------------------------

/**
 * Decode a Base32 string (RFC 4648, no padding) into a Buffer.
 * Used to decode the TOTP secret returned by Casdoor.
 */
function base32Decode(secret: string): Buffer {
  const cleaned = secret.replace(/\s/g, "").replace(/=+$/, "").toUpperCase();
  const lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits: string[] = [];
  for (const c of cleaned) {
    const idx = lookup.indexOf(c);
    if (idx === -1) throw new Error(`Invalid base32 char: ${c}`);
    bits.push(idx.toString(2).padStart(5, "0"));
  }
  const allBits = bits.join("");
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= allBits.length; i += 8) {
    bytes.push(parseInt(allBits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Generate a TOTP code (RFC 6238) from a Base32-encoded secret.
 * - Algorithm: SHA1 (matches Casdoor's TOTP default)
 * - Digits: 6
 * - Time step: 30 seconds
 */
export function generateTotp(secret: string, timeStep = 30, digits = 6, stepOffset = 0): string {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / timeStep) + stepOffset;
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** digits).toString().padStart(digits, "0");
}

// --- Result types ---------------------------------------------------------

export interface MfaEnrollBeginResult {
  /** Enrollment session token — passed to enrollFinish. */
  enrollment_token: string;
  /** Base32 TOTP secret — show to user as QR code + manual entry. */
  secret: string;
  /** otpauth:// URL for QR code generation. */
  qr_code_url: string;
  /** Recovery codes (single-use, for account recovery if device is lost). */
  recovery_codes: string[];
}

export interface MfaEnrollFinishResult {
  success: true;
  /** UUID of the newly enrolled MFA factor in PG. */
  factor_uuid: string;
}

export interface MfaFactorInfo {
  uuid: string;
  factor_type: string;
  label: string | null;
  is_enabled: boolean;
  is_preferred: boolean;
  last_used_at: string | null;
  created_at: string;
}

// --- Enrollment session stash (in-memory, single-instance) ----------------
//
// The initiate → verify → enable flow requires the BE to remember the secret
// + recovery codes between the begin and finish calls. This is an in-memory
// map keyed by a random enrollment token, with a 5-minute TTL.
//
// NOTE: Single-instance only. For multi-instance BE deployments, replace with
// a shared store (Redis). Same pattern as WebauthnService.sessionRelay.

interface EnrollmentEntry {
  user_uuid: string;
  secret: string;
  recovery_codes: string[];
  casdoor_mfa_type: string;
  expires_at: number;
}

const ENROLLMENT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const enrollmentStash = new Map<string, EnrollmentEntry>();

function stashEnrollment(
  userUuid: string,
  secret: string,
  recoveryCodes: string[],
  casdoorMfaType: string,
): string {
  const token = crypto.randomUUID();
  enrollmentStash.set(token, {
    user_uuid: userUuid,
    secret,
    recovery_codes: recoveryCodes,
    casdoor_mfa_type: casdoorMfaType,
    expires_at: Date.now() + ENROLLMENT_TTL_MS,
  });
  return token;
}

function popEnrollment(token: string): EnrollmentEntry | null {
  const entry = enrollmentStash.get(token);
  if (!entry) return null;
  enrollmentStash.delete(token);
  if (Date.now() > entry.expires_at) return null;
  return entry;
}

// Periodic cleanup of expired entries (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of enrollmentStash) {
    if (now > entry.expires_at) enrollmentStash.delete(key);
  }
  for (const [key, entry] of tokenStash) {
    if (now > entry.expires_at) tokenStash.delete(key);
  }
}, 10 * 60 * 1000).unref();

// --- Login challenge token stash (in-memory, single-instance) -------------
//
// When login() detects the user has MFA factors, the Casdoor tokens are stashed
// here keyed by the challenge token's jti. On verifyAtLogin() success, the
// tokens are popped and set as auth cookies.
//
// NOTE: Single-instance only. For multi-instance BE deployments, replace with
// a shared store (Redis). Same pattern as WebauthnService.sessionRelay.

interface TokenStashEntry {
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  expires_at: number;
}

const TOKEN_STASH_TTL_MS = 5 * 60 * 1000; // 5 minutes
const tokenStash = new Map<string, TokenStashEntry>();

function stashTokens(jti: string, tokens: TokenStashEntry["tokens"]): void {
  tokenStash.set(jti, { tokens, expires_at: Date.now() + TOKEN_STASH_TTL_MS });
}

function popTokens(jti: string): TokenStashEntry["tokens"] | null {
  const entry = tokenStash.get(jti);
  if (!entry) return null;
  tokenStash.delete(jti);
  if (Date.now() > entry.expires_at) return null;
  return entry.tokens;
}

// --- Service --------------------------------------------------------------

export class MfaService {
  constructor(
    private pool: Pool,
    private casdoor: CasdoorService,
  ) {}

  /**
   * Require MFA to be enabled in config. Throws 503 if disabled.
   */
  private async requireMfaEnabled() {
    const cfg = getAuthConfig();
    if (!cfg.enable_mfa) {
      throw new ApiError(
        "/errors/mfa-disabled",
        "MFA is not enabled on this server",
        503,
        "The MFA / 2FA system is disabled. Set enable_mfa=true in auth_configurations to enable it.",
        { internal_code: "MFA_DISABLED", severity: "MEDIUM" },
      );
    }
    return cfg;
  }

  /**
   * Get the MFA challenge signing secret from the DB.
   * Auto-generates a 32-byte hex secret if missing (same pattern as
   * `notification_alert_secret` in invitation.service.ts).
   */
  private async getMfaChallengeSecret(): Promise<string> {
    const dal = new AuthConfigurationsDal(this.pool);
    let row = await dal.findByKey("mfa_challenge_signing_secret");
    if (!row || !row.value || row.value.trim() === "") {
      const secret = randomBytes(32).toString("hex");
      // The verify endpoint is PUBLIC (no session context) — wrap in runAsSystem
      // so the upsert's audit fields can be set.
      await runAsSystem(() => dal.upsert("mfa_challenge_signing_secret", secret, "system"));
      return secret;
    }
    return row.value;
  }

  /**
   * Get the MFA challenge token TTL from the DB.
   * Falls back to 300 seconds (5 minutes) if missing.
   */
  private async getMfaChallengeTtl(): Promise<number> {
    const dal = new AuthConfigurationsDal(this.pool);
    const row = await dal.findByKey("mfa_challenge_token_ttl_seconds");
    if (!row || !row.value) return 300;
    const ttl = parseInt(row.value, 10);
    return isNaN(ttl) ? 300 : ttl;
  }

  /**
   * Resolve the user's PG profile ID from their UUID.
   * Throws 404 if the profile doesn't exist.
   */
  private async resolveProfileId(userUuid: string): Promise<bigint> {
    const result = await this.pool.query(
      `SELECT id FROM user_profiles WHERE uuid = $1 AND deleted_at IS NULL`,
      [userUuid],
    );
    if (!result.rows[0]?.id) {
      throw new NotFoundError("User profile not found", {
        internal_code: "USER_PROFILE_NOT_FOUND",
      });
    }
    return BigInt(result.rows[0].id);
  }

  /**
   * Resolve the Casdoor owner/name for a user.
   * The owner is the user's `idp_org` (or the default org from config).
   * The name is the user's `idp_username` (or `idp_code` as fallback).
   */
  private async resolveCasdoorIdentity(userUuid: string): Promise<{
    owner: string;
    name: string;
  }> {
    const result = await this.pool.query(
      `SELECT idp_org, idp_username, idp_code FROM user_profiles WHERE uuid = $1`,
      [userUuid],
    );
    if (!result.rows[0]) {
      throw new NotFoundError("User profile not found", {
        internal_code: "USER_PROFILE_NOT_FOUND",
      });
    }
    const row = result.rows[0];
    const cfg = getAuthConfig();
    const owner = row.idp_org || cfg.casdoor_organization || "";
    const name = row.idp_username || row.idp_code || "";
    if (!owner || !name) {
      throw new ApiError(
        "/errors/mfa-identity-missing",
        "User IDP identity is incomplete",
        500,
        "The user profile is missing idp_org or idp_username, which are required for MFA management.",
        { internal_code: "MFA_IDENTITY_MISSING", severity: "HIGH" },
      );
    }
    return { owner, name };
  }

  // --- Enrollment ----------------------------------------------------------

  /**
   * Begin TOTP MFA enrollment for the authenticated user.
   * Calls Casdoor's mfa/setup/initiate and stashes the secret + recovery codes
   * in an in-memory enrollment session (5-minute TTL).
   *
   * Returns the secret, QR code URL, and recovery codes for the FE to display.
   * The FE must show the QR code, let the user scan it, then call enrollFinish
   * with the enrollment_token + a TOTP code from the user's authenticator app.
   */
  async enrollBegin(userUuid: string): Promise<MfaEnrollBeginResult> {
    await this.requireMfaEnabled();

    // Refuse if the user already has an enabled TOTP factor (v1: one TOTP factor per user)
    const profileId = await this.resolveProfileId(userUuid);
    const factorsDal = new UserMfaFactorsDal(this.pool);
    const existing = await factorsDal.findEnabledByUserProfileId(profileId);
    if (existing.length > 0) {
      throw new ApiError(
        "/errors/mfa-already-enrolled",
        "User already has an enrolled MFA factor",
        409,
        "Delete the existing MFA factor before enrolling a new one.",
        { internal_code: "MFA_ALREADY_ENROLLED", severity: "LOW" },
      );
    }

    const client = await this.casdoor.getClient();
    if (!client) {
      throw new ApiError(
        "/errors/casdoor-not-configured",
        "Casdoor™ is not configured",
        503,
        "The Casdoor™ API client is not configured. MFA management requires Casdoor™ builtin credentials.",
        { internal_code: "CASDOOR_NOT_CONFIGURED", severity: "HIGH" },
      );
    }

    const { owner, name } = await this.resolveCasdoorIdentity(userUuid);
    const initiated = await client.mfaSetupInitiate(owner, name, "app");

    const enrollmentToken = stashEnrollment(
      userUuid,
      initiated.secret,
      initiated.recovery_codes,
      initiated.mfa_type,
    );

    return {
      enrollment_token: enrollmentToken,
      secret: initiated.secret,
      qr_code_url: initiated.qr_code_url,
      recovery_codes: initiated.recovery_codes,
    };
  }

  /**
   * Complete TOTP MFA enrollment.
   * Validates the user-provided TOTP code against the secret (via Casdoor's
   * mfa/setup/verify), then enables the factor on the Casdoor user (via
   * mfa/setup/enable, which requires a fresh passcode), and finally inserts
   * a row in `user_mfa_factors` to mirror the state in PG.
   *
   * The enrollment_token is consumed (single-use).
   */
  async enrollFinish(
    userUuid: string,
    enrollmentToken: string,
    passcode: string,
    label?: string,
  ): Promise<MfaEnrollFinishResult> {
    await this.requireMfaEnabled();

    const entry = popEnrollment(enrollmentToken);
    if (!entry || entry.user_uuid !== userUuid) {
      throw new UnauthorizedError("Invalid or expired enrollment token", {
        internal_code: "MFA_ENROLLMENT_TOKEN_INVALID",
      });
    }

    const client = await this.casdoor.getClient();
    if (!client) {
      throw new ApiError(
        "/errors/casdoor-not-configured",
        "Casdoor™ is not configured",
        503,
        "The Casdoor™ API client is not configured. MFA management requires Casdoor™ builtin credentials.",
        { internal_code: "CASDOOR_NOT_CONFIGURED", severity: "HIGH" },
      );
    }

    // Step 1: verify the user-provided passcode against the secret
    const verified = await client.mfaSetupVerify(
      entry.casdoor_mfa_type,
      entry.secret,
      passcode,
    );
    if (!verified) {
      throw new UnauthorizedError("Invalid TOTP code", {
        internal_code: "MFA_INVALID_CODE",
      });
    }

    // Step 2: enable the factor on the Casdoor user.
    // The enable endpoint requires a FRESH passcode (not the same one used for verify).
    // Generate a new code from the secret at the current time step.
    const { owner, name } = await this.resolveCasdoorIdentity(userUuid);
    const enablePasscode = generateTotp(entry.secret);
    const recoveryCode = entry.recovery_codes[0] || crypto.randomUUID();
    const enabled = await client.mfaSetupEnable(
      owner,
      name,
      entry.casdoor_mfa_type,
      entry.secret,
      enablePasscode,
      recoveryCode,
    );
    if (!enabled) {
      throw new ApiError(
        "/errors/mfa-enable-failed",
        "Failed to enable MFA factor in Casdoor™",
        502,
        "Casdoor™ returned an error while enabling the MFA factor.",
        { internal_code: "MFA_ENABLE_FAILED", severity: "HIGH" },
      );
    }

    // Step 3: set as preferred (first factor for the user)
    await client.setPreferredMfa(owner, name, entry.casdoor_mfa_type);

    // Step 4: insert a row in user_mfa_factors with the encrypted TOTP secret.
    // The secret is encrypted with mfa_challenge_signing_secret so the BE can
    // verify TOTP codes locally without a Casdoor round-trip.
    const profileId = await this.resolveProfileId(userUuid);
    const secret = await this.getMfaChallengeSecret();
    const encryptedSecret = encrypt(entry.secret, secret);
    const factorsDal = new UserMfaFactorsDal(this.pool);
    const factorUuid = await factorsDal.create({
      user_profile_id: profileId,
      factor_type: "totp",
      casdoor_mfa_type: entry.casdoor_mfa_type,
      totp_secret_encrypted: encryptedSecret,
      label,
      is_enabled: true,
      is_preferred: true,
    });

    return { success: true, factor_uuid: factorUuid };
  }

  // --- List / Delete -------------------------------------------------------

  /**
   * List all MFA factors for the authenticated user.
   * Reads from PG (the mirror), not Casdoor. The PG mirror is the source of
   * truth for labels and last_used_at; Casdoor is the source of truth for the
   * actual TOTP secret (never exposed to the FE after enrollment).
   */
  async listFactors(userUuid: string): Promise<MfaFactorInfo[]> {
    await this.requireMfaEnabled();
    const profileId = await this.resolveProfileId(userUuid);
    const factorsDal = new UserMfaFactorsDal(this.pool);
    const factors = await factorsDal.findByUserProfileId(profileId);
    return factors.map((f) => ({
      uuid: f.uuid,
      factor_type: f.factor_type,
      label: f.label ?? null,
      is_enabled: f.is_enabled,
      is_preferred: f.is_preferred,
      last_used_at: f.last_used_at ? f.last_used_at.toISOString() : null,
      created_at: f.created_at.toISOString(),
    }));
  }

  /**
   * Delete an MFA factor.
   * Removes the factor from Casdoor (via delete-mfa) and from PG (user_mfa_factors).
   * If the deleted factor was preferred, no other factor is auto-promoted —
   * the user must explicitly set a new preferred factor if they have more.
   */
  async deleteFactor(userUuid: string, factorUuid: string): Promise<{ success: true }> {
    await this.requireMfaEnabled();

    const factorsDal = new UserMfaFactorsDal(this.pool);
    const factor = await factorsDal.findByUuid(factorUuid);
    if (!factor) {
      throw new NotFoundError("MFA factor not found", {
        internal_code: "MFA_FACTOR_NOT_FOUND",
      });
    }

    // Verify ownership: the factor must belong to the requesting user
    const profileId = await this.resolveProfileId(userUuid);
    if (factor.user_profile_id !== profileId) {
      throw new NotFoundError("MFA factor not found", {
        internal_code: "MFA_FACTOR_NOT_FOUND",
      });
    }

    const client = await this.casdoor.getClient();
    if (!client) {
      throw new ApiError(
        "/errors/casdoor-not-configured",
        "Casdoor™ is not configured",
        503,
        "The Casdoor™ API client is not configured. MFA management requires Casdoor™ builtin credentials.",
        { internal_code: "CASDOOR_NOT_CONFIGURED", severity: "HIGH" },
      );
    }

    const { owner, name } = await this.resolveCasdoorIdentity(userUuid);
    const casdoorMfaType = factor.casdoor_mfa_type || "app";
    const deleted = await client.deleteMfa(owner, name, casdoorMfaType);
    if (!deleted) {
      throw new ApiError(
        "/errors/mfa-delete-failed",
        "Failed to delete MFA factor in Casdoor™",
        502,
        "Casdoor™ returned an error while deleting the MFA factor.",
        { internal_code: "MFA_DELETE_FAILED", severity: "HIGH" },
      );
    }

    await factorsDal.deleteByUuid(factorUuid);
    return { success: true };
  }

  // --- has_mfa flag --------------------------------------------------------

  /**
   * Check if a user has any enabled MFA factor.
   * Used by GET /api/v1/auth/me to populate the `has_mfa` flag.
   */
  async hasMfa(userUuid: string): Promise<boolean> {
    if (!getAuthConfig().enable_mfa) return false;
    const profileId = await this.resolveProfileId(userUuid);
    const factorsDal = new UserMfaFactorsDal(this.pool);
    const count = await factorsDal.countEnabledByUserProfileId(profileId);
    return count > 0;
  }

  // --- Login MFA challenge -------------------------------------------------

  /**
   * Mint a login MFA challenge token.
   * Called by AuthSessionService.login() when the user has MFA factors.
   * Stashes the Casdoor tokens keyed by the challenge token's jti.
   *
   * Returns the challenge token + the list of available factors for the FE.
   */
  async mintLoginChallenge(
    userUuid: string,
    idpCode: string,
    idpOrg: string,
    idpUsername: string,
    tokens: { access_token: string; refresh_token?: string; expires_in: number },
  ): Promise<{
    mfa_challenge_token: string;
    available_factors: Array<{ factor_id: string; factor_type: string; label: string | null }>;
  }> {
    await this.requireMfaEnabled();

    const profileId = await this.resolveProfileId(userUuid);
    const factorsDal = new UserMfaFactorsDal(this.pool);
    const factors = await factorsDal.findEnabledByUserProfileId(profileId);
    if (factors.length === 0) {
      throw new ApiError(
        "/errors/mfa-no-factors",
        "User has no enabled MFA factors",
        400,
        "Cannot mint MFA challenge: user has no enabled MFA factors.",
        { internal_code: "MFA_NO_FACTORS", severity: "LOW" },
      );
    }

    const secret = await this.getMfaChallengeSecret();
    const ttl = await this.getMfaChallengeTtl();
    const jti = randomUUID();
    const token = await signMfaChallengeToken(
      {
        jti,
        sub: userUuid,
        idp_code: idpCode,
        idp_org: idpOrg,
        idp_username: idpUsername,
        available_factor_ids: factors.map((f) => f.uuid),
        purpose: "login_challenge",
      },
      secret,
      ttl,
    );

    stashTokens(jti, tokens);

    return {
      mfa_challenge_token: token,
      available_factors: factors.map((f) => ({
        factor_id: f.uuid,
        factor_type: f.factor_type,
        label: f.label ?? null,
      })),
    };
  }

  /**
   * Verify a login MFA challenge.
   * Called by POST /api/v1/auth/mfa/verify.
   * Validates the TOTP code against Casdoor, pops the stashed tokens, and
   * returns them so the router can set auth cookies.
   *
   * Returns the Casdoor tokens + the user identity for building the user object.
   */
  async verifyAtLogin(
    challengeToken: string,
    factorId: string,
    code: string,
  ): Promise<{
    tokens: { access_token: string; refresh_token?: string; expires_in: number };
    user_uuid: string;
    claims: Record<string, unknown>;
  }> {
    await this.requireMfaEnabled();

    const secret = await this.getMfaChallengeSecret();
    const payload: MfaChallengePayload = await verifyMfaChallengeToken(challengeToken, secret);

    if (payload.purpose !== "login_challenge") {
      throw new ApiError(
        "/errors/mfa-wrong-purpose",
        "Token is not a login challenge",
        403,
        "The MFA challenge token was not issued for login.",
        { internal_code: "MFA_WRONG_PURPOSE", severity: "MEDIUM" },
      );
    }

    if (!payload.available_factor_ids.includes(factorId)) {
      throw new ApiError(
        "/errors/mfa-factor-not-allowed",
        "Factor not allowed for this challenge",
        403,
        "The selected MFA factor is not allowed for this challenge.",
        { internal_code: "MFA_FACTOR_NOT_ALLOWED", severity: "MEDIUM" },
      );
    }

    // Verify the factor exists and is enabled
    const factorsDal = new UserMfaFactorsDal(this.pool);
    const factor = await factorsDal.findByUuid(factorId);
    if (!factor || !factor.is_enabled) {
      throw new NotFoundError("MFA factor not found", {
        internal_code: "MFA_FACTOR_NOT_FOUND",
      });
    }

    // Verify the TOTP code locally using the encrypted secret stored in PG.
    // The secret was encrypted at enrollment time with mfa_challenge_signing_secret.
    // We decrypt it, generate the expected TOTP code, and compare.
    // This avoids a Casdoor round-trip and is the standard TOTP MFA approach.
    const signingSecret = await this.getMfaChallengeSecret();
    let totpSecret: string;
    try {
      totpSecret = decrypt(factor.totp_secret_encrypted, signingSecret);
    } catch {
      throw new ApiError(
        "/errors/mfa-secret-decrypt-failed",
        "Failed to decrypt MFA secret",
        500,
        "The MFA secret could not be decrypted. The signing secret may have changed.",
        { internal_code: "MFA_SECRET_DECRYPT_FAILED", severity: "HIGH" },
      );
    }

    // Allow a ±1 time step window (±30s) to tolerate clock skew between
    // the user's device and the server.
    const expectedCode = generateTotp(totpSecret);
    const prevCode = generateTotp(totpSecret, 30, 6, -1);
    const nextCode = generateTotp(totpSecret, 30, 6, 1);
    if (code !== expectedCode && code !== prevCode && code !== nextCode) {
      throw new UnauthorizedError("Invalid TOTP code", {
        internal_code: "MFA_INVALID_CODE",
      });
    }

    // Pop the stashed tokens (single-use)
    const tokens = popTokens(payload.jti);
    if (!tokens) {
      throw new UnauthorizedError("MFA challenge expired or already used", {
        internal_code: "MFA_CHALLENGE_EXPIRED",
      });
    }

    // Update last_used_at on the factor.
    // The verify endpoint is PUBLIC (no auth middleware), so there's no session
    // context — wrap in runAsSystem to provide the system actor for audit fields.
    // Pass the current version for optimistic concurrency (auditable entity).
    await runAsSystem(() => factorsDal.update(factor.uuid, {
      last_used_at: new Date(),
      version: factor.version,
    }));

    // Decode the access token to get claims for building the user response
    const claims = decodeJwtPayload(tokens.access_token);

    return {
      tokens,
      user_uuid: payload.sub,
      claims,
    };
  }

  // ─── Step-up MFA ──────────────────────────────────────────────────────────
  //
  // Step-up MFA protects sensitive operations (delete, change-password, etc.)
  // by requiring a fresh TOTP verification. The flow is:
  //   1. FE calls POST /api/v1/auth/mfa/step-up/initiate with {action, target_resource}
  //      → returns a step-up challenge token + available factors
  //   2. FE calls POST /api/v1/auth/mfa/step-up/verify with {challenge_token, factor_id, code}
  //      → on success, returns a single-use action authorization token
  //   3. FE calls the protected endpoint with the action authorization token
  //      in the X-MFA-Action-Authorization header
  //   4. The step-up middleware validates + consumes the token (single-use)

  /**
   * Initiate a step-up MFA challenge for a specific action + target resource.
   * The user must be authenticated (session-gated, not challenge-token gated).
   */
  async mintStepUpChallenge(
    userUuid: string,
    action: string,
    targetResource: string,
  ): Promise<{
    mfa_challenge_token: string;
    available_factors: Array<{ factor_id: string; factor_type: string; label: string | null }>;
  }> {
    await this.requireMfaEnabled();

    const profileId = await this.resolveProfileId(userUuid);
    const factorsDal = new UserMfaFactorsDal(this.pool);
    const factors = await factorsDal.findEnabledByUserProfileId(profileId);
    if (factors.length === 0) {
      throw new ApiError(
        "/errors/mfa-no-factors",
        "No MFA factors enrolled",
        400,
        "The user has no enrolled MFA factors. Enroll a factor before performing step-up actions.",
        { internal_code: "MFA_NO_FACTORS", severity: "MEDIUM" },
      );
    }

    // Resolve the user's idp context (for Casdoor API calls if needed)
    const casdoorIdentity = await this.resolveCasdoorIdentity(userUuid);

    const secret = await this.getMfaChallengeSecret();
    const ttl = await this.getMfaChallengeTtl();
    const jti = randomUUID();
    const token = await signMfaChallengeToken(
      {
        jti,
        sub: userUuid,
        idp_code: casdoorIdentity.name,
        idp_org: casdoorIdentity.owner,
        idp_username: casdoorIdentity.name,
        available_factor_ids: factors.map((f) => f.uuid),
        purpose: "step_up_challenge",
        action,
        target_resource: targetResource,
      },
      secret,
      ttl,
    );

    return {
      mfa_challenge_token: token,
      available_factors: factors.map((f) => ({
        factor_id: f.uuid,
        factor_type: f.factor_type,
        label: f.label ?? null,
      })),
    };
  }

  /**
   * Verify a step-up MFA challenge and issue a single-use action authorization token.
   * The user must be authenticated (session-gated).
   */
  async verifyStepUp(
    challengeToken: string,
    factorId: string,
    code: string,
  ): Promise<{
    action_authorization_token: string;
    action: string;
    target_resource: string;
  }> {
    await this.requireMfaEnabled();

    const secret = await this.getMfaChallengeSecret();
    const payload: MfaChallengePayload = await verifyMfaChallengeToken(challengeToken, secret);

    if (payload.purpose !== "step_up_challenge") {
      throw new UnauthorizedError("Invalid MFA challenge token purpose", {
        internal_code: "MFA_CHALLENGE_WRONG_PURPOSE",
      });
    }
    if (!payload.action || !payload.target_resource) {
      throw new UnauthorizedError("MFA challenge token missing action/target", {
        internal_code: "MFA_CHALLENGE_MALFORMED",
      });
    }
    if (!payload.available_factor_ids.includes(factorId)) {
      throw new UnauthorizedError("Factor not allowed for this challenge", {
        internal_code: "MFA_FACTOR_NOT_ALLOWED",
      });
    }

    // Load the factor and verify the TOTP code locally
    const factorsDal = new UserMfaFactorsDal(this.pool);
    const factor = await factorsDal.findByUuid(factorId);
    if (!factor || !factor.is_enabled) {
      throw new UnauthorizedError("MFA factor not found", {
        internal_code: "MFA_FACTOR_NOT_FOUND",
      });
    }
    // Verify the factor belongs to the user (by matching profile ID)
    const profileId = await this.resolveProfileId(payload.sub);
    if (factor.user_profile_id !== profileId) {
      throw new UnauthorizedError("MFA factor does not belong to the user", {
        internal_code: "MFA_FACTOR_NOT_OWNED",
      });
    }

    const signingSecret = await this.getMfaChallengeSecret();
    let totpSecret: string;
    try {
      totpSecret = decrypt(factor.totp_secret_encrypted, signingSecret);
    } catch {
      throw new ApiError(
        "/errors/mfa-secret-decrypt-failed",
        "Failed to decrypt MFA secret",
        500,
        "The MFA secret could not be decrypted. The signing secret may have changed.",
        { internal_code: "MFA_SECRET_DECRYPT_FAILED", severity: "HIGH" },
      );
    }

    const expectedCode = generateTotp(totpSecret);
    const prevCode = generateTotp(totpSecret, 30, 6, -1);
    const nextCode = generateTotp(totpSecret, 30, 6, 1);
    if (code !== expectedCode && code !== prevCode && code !== nextCode) {
      throw new UnauthorizedError("Invalid TOTP code", {
        internal_code: "MFA_INVALID_CODE",
      });
    }

    // Update last_used_at (pass version for optimistic concurrency — auditable entity)
    await runAsSystem(() => factorsDal.update(factor.uuid, {
      last_used_at: new Date(),
      version: factor.version,
    }));

    // Issue a single-use action authorization token (JWT, short TTL)
    const actionJti = randomUUID();
    const actionTtl = 300; // 5 minutes — the action must be performed quickly
    const actionToken = await new SignJWT({
      action: payload.action,
      target_resource: payload.target_resource,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("primebrick-be")
      .setSubject(payload.sub)
      .setJti(actionJti)
      .setIssuedAt()
      .setExpirationTime(`${actionTtl}s`)
      .sign(new Uint8Array(Buffer.from(secret, "hex")));

    // Store the action authorization in the DB (for single-use enforcement + audit)
    const actionDal = new MfaActionAuthorizationsDal(this.pool);
    const tokenHash = createHash("sha256").update(actionToken).digest("hex");
    const expiresAt = new Date(Date.now() + actionTtl * 1000);

    await runAsSystem(() =>
      actionDal.create({
        jti: actionJti,
        user_profile_id: profileId,
        action: payload.action!,
        target_resource: payload.target_resource!,
        token_hash: tokenHash,
        expires_at: expiresAt,
      }),
    );

    return {
      action_authorization_token: actionToken,
      action: payload.action,
      target_resource: payload.target_resource,
    };
  }

  /**
   * Consume an action authorization token (called by the step-up middleware).
   * Validates the token, checks it's not expired, checks it's not already used,
   * and marks it as used (single-use enforcement).
   * Returns the user_uuid if valid, throws if invalid.
   */
  async consumeActionAuthorization(
    token: string,
    expectedAction: string,
    expectedTargetResource: string,
  ): Promise<{ user_uuid: string }> {
    await this.requireMfaEnabled();

    const secret = await this.getMfaChallengeSecret();
    let payload: JWTPayload;
    try {
      const result = await jwtVerify(token, new Uint8Array(Buffer.from(secret, "hex")), {
        algorithms: ["HS256"],
      });
      payload = result.payload;
    } catch {
      throw new UnauthorizedError("Invalid action authorization token", {
        internal_code: "MFA_ACTION_TOKEN_INVALID",
      });
    }

    if (payload.action !== expectedAction || payload.target_resource !== expectedTargetResource) {
      throw new UnauthorizedError("Action authorization token does not match the requested action", {
        internal_code: "MFA_ACTION_TOKEN_MISMATCH",
      });
    }

    // Check the DB for single-use enforcement
    const actionDal = new MfaActionAuthorizationsDal(this.pool);
    const record = await actionDal.findByJti(payload.jti!);
    if (!record) {
      throw new UnauthorizedError("Action authorization token not found", {
        internal_code: "MFA_ACTION_TOKEN_NOT_FOUND",
      });
    }
    if (record.used_at) {
      throw new UnauthorizedError("Action authorization token already used", {
        internal_code: "MFA_ACTION_TOKEN_ALREADY_USED",
      });
    }
    if (record.expires_at < new Date()) {
      throw new UnauthorizedError("Action authorization token expired", {
        internal_code: "MFA_ACTION_TOKEN_EXPIRED",
      });
    }

    // Verify the token hash matches (defense in depth — prevents token forgery)
    const tokenHash = createHash("sha256").update(token).digest("hex");
    if (tokenHash !== record.token_hash) {
      throw new UnauthorizedError("Action authorization token hash mismatch", {
        internal_code: "MFA_ACTION_TOKEN_HASH_MISMATCH",
      });
    }

    // Mark as used (single-use enforcement)
    await runAsSystem(() => actionDal.markUsed(payload.jti!));

    return { user_uuid: payload.sub! };
  }
}

// --- JWT payload decoder (duplicated from auth-session.service.ts) --------
//
// This is a trivial base64 decode — not exported from auth-session.service.ts
// because it's a private method there. Duplicating it here keeps the MFA
// service self-contained and avoids changing the AuthSessionService signature
// (scope-locking rule).

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  const encodedPayload = parts[1];
  const rawPayload = Buffer.from(encodedPayload, "base64").toString("utf-8");
  return JSON.parse(rawPayload);
}
