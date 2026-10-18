/**
 * `config_entries` — key/value store for all authentication configuration.
 *
 * Every OIDC, Casdoor, gateway, and auth-mode setting is stored here as a
 * single row keyed by `key` (e.g. "oidc_issuer_url", "auth_mode"). The value
 * is always TEXT; type conversion (string → boolean / enum) happens in
 * `config-entries.service.ts` at read time.
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


import type { UUID } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  Unique,
  AuditTrail,
  EntityBase,
  Auditable,
  Deletable,
} from "@primebrick/dal-pg";
import { Cached } from "@primebrick/sdk";

@Entity("config_entries")
@AuditTrail()
@Cached(300_000) // 5 min TTL — same as other cached entities
export class ConfigEntryEntity
  extends Deletable(Auditable(EntityBase)) {
  @Key()
  id: bigint;

  @Unique()
  uuid: UUID;

  /** Unique config key (e.g. "oidc_issuer_url", "auth_mode", "service_client_shield_secret"). */
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
  @Column({ nullable: false, defaultSql: "false" })
  reserved: boolean;

  @Column({ length: 100, nullable: true })
  group_key?: string | null;







}
