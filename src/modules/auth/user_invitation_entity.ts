/**
 * `user_invitations` — invitation tokens for the user onboarding/welcome flow.
 *
 * When an admin creates a user, an invitation is created here with a SHA-256
 * hash of a random token. The raw token is sent via email (URL fragment) and
 * NEVER stored. The user proves email ownership via OTP, then sets their password.
 *
 * Status flow: PENDING → OTP_SENT → COMPLETED
 *              PENDING → EXPIRED (token expired)
 *              PENDING → REVOKED (admin revoked)
 *
 * This table is NOT soft-deletable (invitations are immutable records — they
 * transition status, they are never deleted).
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

export type InvitationStatus = "PENDING" | "OTP_SENT" | "COMPLETED" | "EXPIRED" | "REVOKED";

@Entity("user_invitations")
@AuditTrail()
export class UserInvitationEntity implements IAuditableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: string;

  /** FK to user_profiles.id (not a @Column — it's a raw FK, no ORM relationship). */
  user_profile_id: bigint;

  /** SHA-256 hash of the invitation token (raw token never stored). */
  @Unique()
  @Column({ nullable: false })
  token_hash: string;

  /** PENDING | OTP_SENT | COMPLETED | EXPIRED | REVOKED. */
  @Column({ nullable: false })
  status: InvitationStatus;

  /** Email address where the invitation was sent (BE only, never returned to FE). */
  @Column({ length: 320, nullable: false })
  email: string;

  /** Token expiry timestamp (default: now() + invitation_expiry_days). */
  @Column({ pgType: "timestamp with time zone", nullable: false })
  expires_at: Date;

  /** When the user completed onboarding (null until COMPLETED). */
  @Column({ pgType: "timestamp with time zone", nullable: true })
  completed_at?: Date;

  /** SHA-256 hash of the 6-digit OTP code (null if not sent). */
  @Column({ nullable: true })
  otp_hash?: string;

  /** OTP validity window (5 minutes from send). */
  @Column({ pgType: "timestamp with time zone", nullable: true })
  otp_expires_at?: Date;

  /** Failed OTP verify attempts (max 10). */
  @Column({ pgType: "integer", nullable: false, defaultSql: "0" })
  otp_attempts: number;

  /** When the user verified the OTP (gate for password set). */
  @Column({ pgType: "timestamp with time zone", nullable: true })
  otp_verified_at?: Date;

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
