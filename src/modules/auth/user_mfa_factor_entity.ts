/**
 * `user_mfa_factors` — MFA factors tracked in PG (mirrors Casdoor MFA setup).
 *
 * The actual TOTP secret is stored in Casdoor. This table is a 1-N mirror that tracks:
 *   - which user enrolled which MFA factor
 *   - the factor type (TOTP only in v1)
 *   - the Casdoor MFA type ("app" for TOTP)
 *   - a user-given label (e.g. "Google Authenticator", "Authy")
 *   - whether the factor is enabled and preferred
 *   - when the factor was last used
 *
 * This allows the BE to:
 *   - count MFA factors per user (for has_mfa flag in /auth/me)
 *   - show MFA factors in the profile page
 *   - determine which factors are available for login/step-up challenges
 */

import type { IAuditableEntity } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  Unique,
  AuditableField,
  AuditableFieldType,
  AuditTrail,
} from "@primebrick/dal-pg";

/** MFA factor types supported by Primebrick. v1 = TOTP only. */
export type MfaFactorType = "totp";

@Entity("user_mfa_factors")
@AuditTrail()
export class UserMfaFactorEntity implements IAuditableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: string;

  /** FK to user_profiles.id. */
  user_profile_id: bigint;

  /** Factor type: "totp" (v1 only). */
  @Column({ nullable: false })
  factor_type: MfaFactorType;

  /** Casdoor's mfaType value: "app" for TOTP. */
  @Column({ nullable: true })
  casdoor_mfa_type?: string;

  /**
   * TOTP secret encrypted with `mfa_challenge_signing_secret` (AES-256-GCM).
   * Stored at enrollment time so the BE can verify TOTP codes locally without
   * a Casdoor round-trip. Casdoor stores its own copy of the secret for its
   * web-based MFA flow; this is our copy for the API-based login flow.
   */
  @Column({ nullable: false })
  totp_secret_encrypted: string;

  /** User-given name (e.g. "Google Authenticator", "Authy"). */
  @Column({ length: 100, nullable: true })
  label?: string;

  /** Whether the factor is enabled. */
  @Column({ nullable: false })
  is_enabled: boolean;

  /** Whether this is the preferred factor (shown first in challenge UI). */
  @Column({ nullable: false })
  is_preferred: boolean;

  /** When the factor was last used for verification. */
  @Column({ nullable: true })
  last_used_at?: Date;

  @AuditableField(AuditableFieldType.CREATED_AT)
  created_at: Date;

  @AuditableField(AuditableFieldType.CREATED_BY)
  created_by: string;

  @AuditableField(AuditableFieldType.UPDATED_AT)
  updated_at: Date;

  @AuditableField(AuditableFieldType.UPDATED_BY)
  updated_by: string;

  @AuditableField(AuditableFieldType.VERSION)
  version: number;
}
