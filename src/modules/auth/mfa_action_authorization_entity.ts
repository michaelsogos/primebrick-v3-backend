/**
 * `mfa_action_authorizations` — single-use action authorization tokens for step-up MFA.
 *
 * When a user completes step-up MFA for a specific `{action, target_resource}`,
 * the BE issues a single-use JWT (action authorization token). This table
 * enforces single-use via the `used_at` column:
 *   - On issue: `used_at` is NULL
 *   - On consumption (by the step-up middleware): `used_at` is set to now()
 *   - Replay attempts (used_at !== NULL) are rejected
 *
 * This table also serves as an audit trail: who performed which action on
 * which resource, and when.
 */

import type { IAuditableEntity } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  AuditableField,
  AuditableFieldType,
  AuditTrail,
} from "@primebrick/dal-pg";

@Entity("mfa_action_authorizations")
@AuditTrail()
export class MfaActionAuthorizationEntity implements IAuditableEntity {
  @Key()
  id: bigint;

  /** JWT jti claim — the unique identifier of the action authorization token. */
  @Column({ nullable: false })
  jti: string;

  /** FK to user_profiles.id. */
  user_profile_id: bigint;

  /** The action being authorized (create, update, delete, restore). */
  @Column({ nullable: false })
  action: string;

  /** The target resource being acted upon (e.g. "organizations", "user_profiles"). */
  @Column({ nullable: false })
  target_resource: string;

  /** SHA-256 hash of the JWT token (for lookup, never store the token itself). */
  @Column({ nullable: false })
  token_hash: string;

  /** When the token expires. */
  @Column({ nullable: false })
  expires_at: Date;

  /** When the token was consumed by the middleware. NULL = not yet used. */
  @Column({ nullable: true })
  used_at?: Date;

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
