/**
 * `auth_configurations` — key/value store for all authentication configuration.
 *
 * Every OIDC, Casdoor, gateway, and auth-mode setting is stored here as a
 * single row keyed by `key` (e.g. "oidc_issuer_url", "auth_mode"). The value
 * is always TEXT; type conversion (string → boolean / enum) happens in
 * `config-repo.ts` at read time.
 *
 * This table is the SOLE source of truth for auth config — no env-var
 * fallbacks exist in the auth module (except `DATABASE_URL` for the bootstrap
 * connection and `NODE_ENV` for the cookie `secure` attribute).
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

@Entity("auth_configurations")
@AuditTrail()
export class AuthConfigurationEntity implements IAuditableEntity {
  @Key()
  id: number;

  @Unique()
  uuid: string;

  /** Unique config key (e.g. "oidc_issuer_url", "auth_mode", "gateway_secret"). */
  @Unique()
  @Column({ length: 255, nullable: false })
  key: string;

  /** Config value (TEXT — type conversion happens at read time). */
  @Column({ nullable: true })
  value?: string;

  /** Optional human-readable description of this config key. */
  @Column({ nullable: true })
  description?: string;

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
