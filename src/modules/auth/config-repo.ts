import type { Pool } from "pg";
import { AuthConfigurationsDal } from "./auth_configurations_dal.js";
import { AuthMode } from "@primebrick/sdk";

/**
 * Auth configuration loaded from the `auth_configurations` table.
 *
 * ALL field names are snake_case — matching the DB keys exactly. No DTO
 * renaming. Values are exactly what the DB has: `undefined` if the key is
 * missing, `null` if the row exists but value is NULL, `string` if present.
 * NO fallback defaults — mandatory-field checks throw in `loadAuthConfigFromDb`.
 */
export interface AuthConfigDb {
  // --- Casdoor / OIDC config ---
  casdoor_endpoint?: string;
  casdoor_organization?: string;
  casdoor_client_id?: string;
  casdoor_admin_username?: string;
  casdoor_admin_password?: string;
  casdoor_builtin_client_id?: string;
  casdoor_builtin_client_secret?: string;
  oidc_issuer_url?: string;
  oidc_issuer_type?: string;
  oidc_client_id?: string;
  oidc_client_secret?: string;
  oidc_audience?: string;
  enable_email_verification_check: boolean; // parsed from "true"/"false"
  password_policy?: string;

  // --- Auth mode + roles path ---
  auth_mode: AuthMode; // validated + normalized to uppercase
  auth_roles_path?: string;

  // --- Gateway config (only required in GATEWAY mode) ---
  gateway_secret?: string;
  gateway_secret_header?: string;
  gateway_public_secret?: string;
  gateway_public_secret_header?: string;
  gateway_header_user_id?: string;
  gateway_header_email?: string;
  gateway_header_name?: string;
  gateway_header_roles?: string;
  gateway_header_idp_code?: string;
  gateway_header_idp_org?: string;
  gateway_header_idp_username?: string;
}

/**
 * Load auth configuration from the `auth_configurations` table via the DAL.
 *
 * Uses `AuthConfigurationsDal.findAll()` — NO raw SQL strings.
 * Values are exactly what the DB has. Mandatory-field checks throw before
 * the return. The only transformations are TYPE conversions:
 *   - `enable_email_verification_check`: string → boolean
 *   - `auth_mode`: validated + normalized to uppercase
 * NO lowercasing, NO fallback defaults, NO field-by-field DTO mapping.
 */
export async function loadAuthConfigFromDb(pool: Pool): Promise<AuthConfigDb> {
  const dal = new AuthConfigurationsDal(pool);
  const rows = await dal.findAll();

  // Reduce typed entity rows into a key/value map. Snake_case keys preserved
  // from the DB — NO renaming. Values are exactly what the DB has:
  //   - undefined if the key doesn't exist in the DB
  //   - null if the row exists but value is NULL
  //   - string if the row exists with a value
  // NO coercion to "" — that would mix real data with fake defaults.
  const settings = rows.reduce((acc, row) => {
    acc[row.key] = row.value ?? null;
    return acc;
  }, {} as Record<string, string | null>);

  // --- Mandatory-field checks (fail loud, no silent defaults) ---
  if (!settings.auth_mode) {
    throw new Error("[auth] auth_mode is missing in auth_configurations table");
  }
  const mode = settings.auth_mode.toUpperCase();
  if (mode !== AuthMode.STANDALONE && mode !== AuthMode.GATEWAY) {
    throw new Error(
      `[auth] auth_mode must be "${AuthMode.STANDALONE}" or "${AuthMode.GATEWAY}", got: "${mode}"`
    );
  }

  // auth_roles_path is mandatory in all modes — used to extract roles from JWT.
  if (!settings.auth_roles_path) {
    throw new Error("[auth] auth_roles_path is missing in auth_configurations table");
  }

  // In GATEWAY mode, ALL gateway fields are mandatory — no fake defaults.
  if (mode === AuthMode.GATEWAY) {
    const requiredGatewayFields = [
      "gateway_secret",
      "gateway_secret_header",
      "gateway_public_secret",
      "gateway_public_secret_header",
      "gateway_header_user_id",
      "gateway_header_email",
      "gateway_header_name",
      "gateway_header_roles",
      "gateway_header_idp_code",
      "gateway_header_idp_org",
      "gateway_header_idp_username",
    ];
    for (const key of requiredGatewayFields) {
      if (!settings[key]) {
        throw new Error(
          `[auth] ${key} is missing or empty in auth_configurations table (required in GATEWAY mode)`
        );
      }
    }
  }

  // In STANDALONE mode, OIDC fields are mandatory — no fake defaults.
  if (mode === AuthMode.STANDALONE) {
    const requiredOidcFields = [
      "oidc_issuer_url",
      "oidc_client_id",
      "oidc_client_secret",
      "oidc_issuer_type",
    ];
    for (const key of requiredOidcFields) {
      if (!settings[key]) {
        throw new Error(
          `[auth] ${key} is missing or empty in auth_configurations table (required in STANDALONE mode)`
        );
      }
    }
  }

  // Spread the key/value map AS-IS. Override ONLY the field that needs a
  // real TYPE transformation: enable_email_verification_check (string DB →
  // bool TS). auth_mode is normalized to uppercase for enum comparison.
  // NO lowercasing — data quality is enforced at the upsert path.
  // NO field-by-field DTO mapping. NO fallback defaults.
  return {
    ...settings,
    enable_email_verification_check: settings.enable_email_verification_check === "true",
    auth_mode: mode, // normalized to uppercase, already validated above
  } as AuthConfigDb;
}

/**
 * Update a configuration value in the database.
 * Uses the DAL's upsert method — NO raw SQL.
 */
export async function updateAuthConfig(
  pool: Pool,
  key: string,
  value: string,
  updatedBy: string = "system"
): Promise<void> {
  const dal = new AuthConfigurationsDal(pool);
  await dal.upsert(key, value, updatedBy);
}
