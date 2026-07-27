/**
 * Auth module — request/response DTOs and zod schemas.
 *
 * Consolidates the schemas that were previously inlined in `router.ts` so they
 * can be shared between the thin controllers and the services, and so the
 * contract is scannable in one place.
 *
 * Conventions:
 *   - `*BodySchema`   → validates `req.body` (use with `validateBody`).
 *   - `*QuerySchema`  → validates `req.query` (use with `validateQuery`).
 *   - `*ParamSchema`  → validates `req.params` (used inline in controllers).
 *   - `*Response`     → the JSON shape returned to the frontend (View).
 */

import { z } from "zod";
import { PasswordPolicy, passwordZodSchema } from "./password-policy.js";
import { displayNameSchema, idpNameSchema } from "./validation.js";

// --- Session (login / refresh / me) ---------------------------------------

export const LoginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginBody = z.infer<typeof LoginBodySchema>;

export const ProfileUpdateSchema = z
  .object({
    display_name: displayNameSchema(z.string()).optional(),
    email: z.string().email().optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    avatar_initials: z.string().min(1).optional(),
  })
  .strict();
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/** Response shape for `POST /api/v1/auth/login` (success case). */
export interface LoginSuccessResponse {
  success: true;
  user: {
    username: string;
    display_name: string;
    email: string;
    organization: string;
    expires_at: number;
    roles: Array<{ name: string; display_name: string; owner: string }>;
  };
}

// --- Admin user management ------------------------------------------------

export function makeCreateUserSchema(policy: PasswordPolicy) {
  return z.object({
    username: idpNameSchema(z.string()),
    password: passwordZodSchema(policy).optional(),
    display_name: displayNameSchema(z.string()),
    email: z.string().email(),
    roles: z.array(z.string()).optional(),
    avatar_initials: z.string().optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    idp_org: z.string().optional(),
    is_active: z.boolean().default(false),
    is_admin: z.boolean().default(false),
    is_verified: z.boolean().default(false),
    email_verified: z.boolean().default(false),
    send_invitation: z.boolean().default(false),
  }).superRefine((data, ctx) => {
    // Password is required when send_invitation is false
    if (!data.send_invitation && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required when send_invitation is false",
      });
    }
  });
}
export type CreateUserBody = z.infer<ReturnType<typeof makeCreateUserSchema>>;

export const UpdateUserSchema = z
  .object({
    display_name: displayNameSchema(z.string()).optional(),
    email: z.string().email().optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    is_active: z.boolean().optional(),
    is_admin: z.boolean().optional(),
    is_verified: z.boolean().optional(),
    email_verified: z.boolean().optional(),
    roles: z.array(z.string()).optional(),
  })
  .strict();
export type UpdateUserBody = z.infer<typeof UpdateUserSchema>;

// --- User profiles entity CRUD --------------------------------------------

export const UuidParamSchema = z.object({ uuid: z.string().uuid() });
export type UuidParam = z.infer<typeof UuidParamSchema>;

export const UserProfileAuditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
export type UserProfileAuditQuery = z.infer<typeof UserProfileAuditQuerySchema>;

export const UserUpdateBodySchema = z
  .object({
    display_name: displayNameSchema(z.string()).optional(),
    email: z.string().email().max(320).optional().or(z.literal("")),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    avatar_initials: z.string().min(1).max(10).optional(),
    roles: z.array(z.string()).optional(),
  })
  .strict();
export type UserUpdateBody = z.infer<typeof UserUpdateBodySchema>;

export function makeChangePasswordSchema(policy: PasswordPolicy) {
  return z.object({
    newPassword: passwordZodSchema(policy),
  });
}

/**
 * Schema for self-service password change (authenticated user).
 * Requires both current_password (for verification) and newPassword.
 */
export function makeChangeOwnPasswordSchema(policy: PasswordPolicy) {
  return z.object({
    current_password: z.string().min(1, "Current password is required"),
    newPassword: passwordZodSchema(policy),
  });
}
export type ChangeOwnPasswordBody = z.infer<ReturnType<typeof makeChangeOwnPasswordSchema>>;
export type ChangePasswordBody = z.infer<ReturnType<typeof makeChangePasswordSchema>>;

// --- WebAuthn (passkey signin / signup / management) ----------------------

export const WebauthnSigninBeginSchema = z.object({
  /** Omit for discoverable login (passkey-only, no username). */
  username: z.string().optional(),
});
export type WebauthnSigninBeginBody = z.infer<typeof WebauthnSigninBeginSchema>;

export const WebauthnSigninFinishSchema = z.object({
  nonce: z.string().min(1),
  /** Serialized navigator.credentials.get() result (base64url-encoded fields). */
  credential: z.record(z.string(), z.unknown()),
});
export type WebauthnSigninFinishBody = z.infer<typeof WebauthnSigninFinishSchema>;

export const WebauthnSignupFinishSchema = z.object({
  nonce: z.string().min(1),
  /** Serialized navigator.credentials.create() result (base64url-encoded fields). */
  credential: z.record(z.string(), z.unknown()),
  /**
   * Optional User-Agent Client Hints `platformVersion` (e.g. "15.0.0")
   * captured by the FE via `navigator.userAgentData.getHighEntropyValues
   * (["platformVersion"])`. Used to distinguish Windows 10 from Windows 11
   * (the UA string alone reports "Windows NT 10.0" on both). Missing on
   * Firefox/Safari — the BE falls back to the generic "Windows".
   */
  platform_version: z.string().optional(),
});
export type WebauthnSignupFinishBody = z.infer<typeof WebauthnSignupFinishSchema>;

// --- MFA (TOTP enrollment + management) -----------------------------------

export const MfaEnrollFinishSchema = z.object({
  /** Enrollment token from enrollBegin (single-use, 5-minute TTL). */
  enrollment_token: z.string().min(1),
  /** 6-digit TOTP code from the user's authenticator app. */
  passcode: z.string().regex(/^\d{6}$/, "passcode must be 6 digits"),
  /** Optional user-given label (e.g. "Google Authenticator"). */
  label: z.string().max(100).optional(),
});
export type MfaEnrollFinishBody = z.infer<typeof MfaEnrollFinishSchema>;

export const MfaLoginVerifySchema = z.object({
  /** MFA challenge token from the login response (mfa_required branch). */
  mfa_challenge_token: z.string().min(1),
  /** UUID of the factor to use (from available_factors in the login response). */
  factor_id: z.string().min(1),
  /** 6-digit TOTP code from the user's authenticator app. */
  code: z.string().regex(/^\d{6}$/, "code must be 6 digits"),
});
export type MfaLoginVerifyBody = z.infer<typeof MfaLoginVerifySchema>;

export const MfaStepUpInitiateSchema = z.object({
  /** The action being authorized (e.g. "delete", "change_password"). */
  action: z.string().min(1).max(50),
  /** The target resource being acted upon (e.g. "organizations", "user_profiles"). */
  target_resource: z.string().min(1).max(100),
});
export type MfaStepUpInitiateBody = z.infer<typeof MfaStepUpInitiateSchema>;

export const MfaStepUpVerifySchema = z.object({
  /** Step-up challenge token from the initiate response. */
  mfa_challenge_token: z.string().min(1),
  /** UUID of the factor to use. */
  factor_id: z.string().min(1),
  /** 6-digit TOTP code from the user's authenticator app. */
  code: z.string().regex(/^\d{6}$/, "code must be 6 digits"),
});
export type MfaStepUpVerifyBody = z.infer<typeof MfaStepUpVerifySchema>;
