import { Pool } from "pg";

export interface AuthConfigDb {
  casdoorEndpoint: string;
  casdoorOrganization: string;
  casdoorClientId: string;
  casdoorAdminUsername: string;
  casdoorAdminRole: string;
  oidcIssuerUrl: string;
  oidcIssuerType: string;
  oidcClientSecret?: string;
  casdoorAdminPassword?: string;
  casdoorBuiltinClientSecret?: string;
}

/**
 * Load authentication configuration from database.
 * Non-sensitive configuration is stored in auth_configurations table.
 * Secrets are also stored in the table (for OIDC client secret) or remain in .env (for built-in client secret).
 */
export async function loadAuthConfigFromDb(pool: Pool): Promise<AuthConfigDb> {
  const res = await pool.query(
    "SELECT key, value FROM auth_configurations WHERE deleted_at IS NULL"
  );

  const settings = res.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    casdoorEndpoint: settings.casdoor_endpoint || "http://localhost:8000",
    casdoorOrganization: settings.casdoor_organization || "ACME",
    casdoorClientId: settings.casdoor_client_id || "primebrick-api",
    casdoorAdminUsername: settings.casdoor_admin_username || "admin",
    casdoorAdminRole: settings.casdoor_admin_role || "Administrators",
    oidcIssuerUrl: settings.oidc_issuer_url || "http://localhost:8000",
    oidcIssuerType: settings.oidc_issuer_type || "casdoor",
    oidcClientSecret: settings.oidc_client_secret,
    casdoorAdminPassword: settings.casdoor_admin_password,
    casdoorBuiltinClientSecret: settings.casdoor_builtin_client_secret,
  };
}

/**
 * Update a configuration value in the database.
 */
export async function updateAuthConfig(
  pool: Pool,
  key: string,
  value: string,
  updatedBy: string = "system"
): Promise<void> {
  await pool.query(
    `INSERT INTO auth_configurations (key, value, updated_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (key) 
     DO UPDATE SET value = $2, updated_by = $3, updated_at = now()`,
    [key, value, updatedBy]
  );
}
