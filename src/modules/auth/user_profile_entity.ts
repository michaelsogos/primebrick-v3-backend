/**
 * `user_profiles` — Primebrick-side mirror of authenticated identities.
 *
 * Why this table exists:
 *   - The IDP `sub` claim (referred to as `idp_code` here) is the only stable
 *     IDP-side identifier we receive in tokens, but it is **vendor-specific**
 *     and may leak deployment details (e.g. Casdoor `built-in/admin`).
 *   - To keep the API surface IDP-agnostic and to avoid leaking external IDs
 *     in audit fields (`created_by`, `updated_by`, ...), we generate our own
 *     internal `uuid` per user and use *only* that across the application.
 *
 * Resolution flow (auth middleware):
 *   1. Validate token / read gateway headers → obtain `idp_code`.
 *   2. Lookup `user_profiles` by `idp_code`.
 *   3. If missing, INSERT a new row with a fresh UUID (just-in-time provisioning).
 *   4. Attach `user_profiles.uuid` to `req.user.id`.
 *
 * Following the project rule that bigserial PKs are never exposed externally,
 * `id` is internal-only (joins, FKs); only `uuid` is ever surfaced via API.
 */

import type { IAuditableEntity } from "../../domain/entities/iauditable_entity.js";
import {
  Column,
  Entity,
  Key,
  Unique,
  AuditableField,
  AuditableFieldType,
  DeletableField,
  DeletableFieldType,
  AuditTrail,
} from "../../domain/entities/entity-meta.js";

@Entity("user_profiles")
@AuditTrail()
export class UserProfileEntity implements IAuditableEntity {
  @Key()
  id: number;

  @Unique()
  uuid: string;

  /**
   * IDP subject claim. Unique per IDP. We never expose this externally.
   * Length 255 covers Casdoor (`org/user`), Keycloak (uuid), Entra (oid).
   */
  @Unique()
  @Column({ length: 255, nullable: false })
  idp_code: string;

  @Column({ length: 320 })
  email?: string;

  @Column({ length: 255 })
  display_name?: string;

  @Column({ length: 7, nullable: true })
  avatar_color?: string;

  @Column({ pgType: "boolean", defaultSql: "true", nullable: false })
  is_active: boolean;

  @Column({ pgType: "boolean", defaultSql: "false", nullable: false })
  is_admin: boolean;

  @Column({ pgType: "jsonb", nullable: true })
  roles?: string[];

  @Column({ pgType: "timestamp with time zone", nullable: true })
  last_synced_at?: Date;

  @Column({ length: 255, nullable: true })
  idp_org?: string;

  @Column({ length: 255, nullable: true })
  idp_username?: string;

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

  @DeletableField(DeletableFieldType.DELETED_AT)
  deleted_at?: Date;

  @DeletableField(DeletableFieldType.DELETED_BY)
  deleted_by?: string;
}
