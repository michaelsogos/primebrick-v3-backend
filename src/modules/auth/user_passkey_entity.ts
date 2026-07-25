/**
 * `user_passkeys` — passkey credentials tracked in PG (mirrors Casdoor
 * `webauthnCredentials` but with Primebrick-managed metadata like labels).
 *
 * The actual cryptographic credential is stored in Casdoor's `webauthnCredentials`
 * bytea column. This table is a 1-N mirror that tracks:
 *   - which user enrolled which credential
 *   - a user-given label (e.g. "Windows Hello", "iPhone")
 *   - the AAGUID (authenticator model identifier)
 *   - transports (internal, hybrid, usb, nfc, ble)
 *
 * This allows the BE to:
 *   - count passkeys per user (for the passkey prompt logic)
 *   - show passkey labels in the profile page
 *   - send notification emails when passkeys are added/removed
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

@Entity("user_passkeys")
@AuditTrail()
export class UserPasskeyEntity implements IAuditableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: string;

  /** FK to user_profiles.id. */
  user_profile_id: bigint;

  /** base64url credential ID from WebAuthn. */
  @Unique()
  @Column({ nullable: false })
  credential_id: string;

  /** Authenticator model identifier (AAGUID). */
  @Column({ nullable: true })
  aaguid?: string;

  /** JSON array of transports ["internal","hybrid","usb","nfc","ble"]. */
  @Column({ pgType: "jsonb", nullable: true })
  transports?: string[];

  /** User-given name (e.g. "Windows Hello", "iPhone"). */
  @Column({ length: 100, nullable: true })
  label?: string;

  /** Last time this credential was used to sign in (null until first signin after this feature ships). */
  @Column({ nullable: true })
  last_used_at?: Date;

  /** WebAuthn AuthenticatorAttachment: "platform" | "cross-platform". */
  @Column({ length: 32, nullable: true })
  authenticator_attachment?: string;

  /** navigator.userAgent captured at enrollment (truncated to 512 chars). */
  @Column({ length: 512, nullable: true })
  user_agent?: string;

  /** OS inferred from UA at enrollment (e.g. Windows, macOS, iOS, Android, Linux). */
  @Column({ length: 64, nullable: true })
  os?: string;

  /** Device model inferred from UA at enrollment (e.g. "Windows PC", "Mac", "iPhone"). */
  @Column({ length: 128, nullable: true })
  device_model?: string;

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
