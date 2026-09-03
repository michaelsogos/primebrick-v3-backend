/**
 * `auth_configurations` — key/value store for all authentication configuration.
 *
 * Every OIDC, Casdoor, gateway, and auth-mode setting is stored here as a
 * single row keyed by `key` (e.g. "oidc_issuer_url", "auth_mode"). The value
 * is always TEXT; type conversion (string → boolean / enum) happens in
 * `config-repo.ts` at read time.
 *
 * Config Table standard columns:
 * - `type` — drives SDK coercion and FE widget selection (see ConfigType in SDK).
 * - `type_config` — JSONB-text extra per-type config (badge inline values, select API URL, etc.).
 * - `label_key` / `description_key` — i18n keys for the setting title and description.
 * - `reserved` — if true, the row is system-critical: editable but not deletable.
 *
 * This table is the SOLE source of truth for auth config — no env-var
 * fallbacks exist in the auth module (except `DATABASE_URL` for the bootstrap
 * connection and `NODE_ENV` for the cookie `secure` attribute).
 */

import type { IAuditableEntity } from "@primebrick/dal-pg";
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
} from "@primebrick/dal-pg";

@Entity("auth_configurations")
@AuditTrail()
export class AuthConfigurationEntity implements IAuditableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: string;

  /** Unique config key (e.g. "oidc_issuer_url", "auth_mode", "gateway_secret"). */
  @Unique()
  @Column({ length: 100, nullable: false })
  key: string;

  /** Config value (TEXT — type conversion happens at read time). null = "not set". */
  @Column({ nullable: true })
  value?: string;

  /** Config value type — drives SDK coercion and FE widget selection. */
  @Column({ length: 50, nullable: false })
  type: string;

  /** JSONB-text extra per-type configuration (badge inline values, select API URL, values_source, etc.). */
  @Column({ nullable: true })
  type_config?: string | null;

  /** i18n key for the setting title. */
  @Column({ length: 100, nullable: true })
  label_key?: string;

  /** i18n key for the explanatory description. */
  @Column({ length: 100, nullable: true })
  description_key?: string;

  /** If true, the row is system-critical: editable but not deletable. */
  @Column({ pgType: "boolean", nullable: false, defaultSql: "false" })
  reserved: boolean;

  @Column({ length: 100, nullable: true })
  group_key?: string | null;

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
