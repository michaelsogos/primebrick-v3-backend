/**
 * MFA challenge token — JWT signed with `mfa_challenge_signing_secret` (HS256).
 *
 * Used for two purposes:
 *   - `login_challenge`: issued by `POST /api/v1/auth/login` when the user has
 *     MFA factors. The FE presents the MFA challenge UI, the user enters a TOTP
 *     code, and `POST /api/v1/auth/mfa/verify` validates it. On success, the BE
 *     sets auth cookies (the Casdoor tokens are stashed server-side keyed by jti).
 *   - `step_up_challenge`: issued by `POST /api/v1/auth/mfa/step-up/initiate`
 *     when a user hits a `requires_mfa_step_up` route. On verify success, the BE
 *     issues a single-use action authorization token.
 *
 * Claims (see plan §7.2):
 *   - iss: "primebrick-be"
 *   - sub: user_profiles.uuid
 *   - jti: random UUID (key into tokenStash)
 *   - idp_code, idp_org, idp_username: carried for Casdoor context
 *   - available_factor_ids: restricts which factors can be verified
 *   - purpose: "login_challenge" | "step_up_challenge"
 *   - action, target_resource: only for step_up_challenge
 *   - iat, exp: standard JWT claims
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { ApiError } from "../../http/api-errors.js";

export type MfaChallengePurpose = "login_challenge" | "step_up_challenge";

export interface MfaChallengePayload {
  jti: string;
  sub: string;
  idp_code: string;
  idp_org: string;
  idp_username: string;
  available_factor_ids: string[];
  purpose: MfaChallengePurpose;
  action?: string;
  target_resource?: string;
}

function toHexSecret(secret: string): Uint8Array {
  // The secret is stored as a hex string (32 random bytes → 64 hex chars).
  // If it's not hex, use the raw bytes (fallback).
  if (/^[0-9a-fA-F]+$/.test(secret) && secret.length % 2 === 0) {
    return new Uint8Array(Buffer.from(secret, "hex"));
  }
  return new Uint8Array(Buffer.from(secret, "utf8"));
}

/**
 * Sign an MFA challenge token.
 * Returns a JWT string (JWS compact serialization).
 */
export async function signMfaChallengeToken(
  payload: MfaChallengePayload,
  secret: string,
  ttlSeconds: number,
): Promise<string> {
  const key = toHexSecret(secret);
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    idp_code: payload.idp_code,
    idp_org: payload.idp_org,
    idp_username: payload.idp_username,
    available_factor_ids: payload.available_factor_ids,
    purpose: payload.purpose,
    ...(payload.action ? { action: payload.action } : {}),
    ...(payload.target_resource ? { target_resource: payload.target_resource } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("primebrick-be")
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(key);
}

/**
 * Verify an MFA challenge token.
 * Returns the payload if valid, throws ApiError if invalid/expired.
 */
export async function verifyMfaChallengeToken(
  token: string,
  secret: string,
): Promise<MfaChallengePayload> {
  const key = toHexSecret(secret);
  let payload: JWTPayload;
  try {
    const result = await jwtVerify(token, key, { algorithms: ["HS256"] });
    payload = result.payload;
  } catch {
    throw new ApiError(
      "/errors/mfa-challenge-token-invalid",
      "MFA challenge token invalid or expired",
      401,
      "The MFA challenge token is invalid or has expired. Please restart the login process.",
      { internal_code: "MFA_CHALLENGE_TOKEN_INVALID", severity: "MEDIUM" },
    );
  }

  // Validate required claims
  if (!payload.jti || !payload.sub || !payload.purpose) {
    throw new ApiError(
      "/errors/mfa-challenge-token-malformed",
      "MFA challenge token malformed",
      401,
      "The MFA challenge token is missing required claims.",
      { internal_code: "MFA_CHALLENGE_TOKEN_MALFORMED", severity: "MEDIUM" },
    );
  }

  return {
    jti: payload.jti,
    sub: payload.sub,
    idp_code: payload.idp_code as string,
    idp_org: payload.idp_org as string,
    idp_username: payload.idp_username as string,
    available_factor_ids: payload.available_factor_ids as string[],
    purpose: payload.purpose as MfaChallengePurpose,
    action: payload.action as string | undefined,
    target_resource: payload.target_resource as string | undefined,
  };
}
