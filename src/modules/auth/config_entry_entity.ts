/**
 * `config_entries` — key/value store for all authentication configuration.
 *
 * Every OIDC, Casdoor, gateway, and auth-mode setting is stored here as a
 * single row keyed by `key` (e.g. "oidc_issuer_url", "auth_mode"). The value
 * is always TEXT; type conversion (string → boolean / enum) happens in
 * `config-entries.service.ts` at read time.
 *
 * Config Table standard columns (inherited from ConfigEntityBase):
 * - `type` — drives SDK coercion and FE widget selection (see ConfigType in SDK).
 * - `type_config` — JSONB-text extra per-type config (badge inline values, select API URL, etc.).
 * - `label_key` / `description_key` — i18n keys for the setting title and description.
 * - `reserved` — if true, the row is system-critical: editable but not deletable.
 *
 * This table is the SOLE source of truth for auth config — no env-var
 * fallbacks exist in the auth module (except `DATABASE_URL` for the bootstrap
 * connection and `NODE_ENV` for the cookie `secure` attribute).
 */

import { ConfigEntityBase, Entity } from "@primebrick/dal-pg";
import { Cached } from "@primebrick/sdk";

@Entity("config_entries")
@Cached(300_000) // 5 min TTL — same as other cached entities
export class ConfigEntryEntity extends ConfigEntityBase {}
