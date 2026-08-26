/**
 * CasdoorService — lifecycle wrapper around `CasdoorApiClient`.
 *
 * Why this exists:
 *   Both `auth/router.ts` and `auth/organizations_router.ts` used to inline an
 *   identical `getCasdoorClient()` lazy-init block that:
 *     1. loads the auth config from the database,
 *     2. falls back to env vars,
 *     3. constructs a `CasdoorApiClient` (or returns `null` when credentials
 *        are missing),
 *     4. caches the instance for the lifetime of the router factory.
 *
 *   Centralizing that here removes the duplication and gives services a single,
 *   request-context-free entry point to the Casdoor admin API. The service does
 *   NOT touch `req`/`res`; it only returns `CasdoorApiClient | null` so callers
 *   can decide how to handle the "not configured" case.
 *
 * Lifecycle:
 *   One instance per router factory (lazy singleton, same pattern the routers
 *   already used). The underlying `CasdoorApiClient` is created on first access
 *   and reused. If the DB config is missing the admin credentials, the
 *   service returns `null` and logs a single warning (no spam on every call).
 */

import type { Pool } from "pg";
import { CasdoorApiClient } from "../casdoor-api-client.js";
import { getAuthConfig } from "../config.js";

export class CasdoorService {
  private client: CasdoorApiClient | null = null;
  private initialized = false;

  constructor(private pool: Pool) {}

  /**
   * Returns the lazily-initialized `CasdoorApiClient`, or `null` when Casdoor
   * admin credentials are not configured (e.g. dev setups without IDP).
   *
   * Reads from the cached auth config (loaded at startup). The camelCase field
   * names passed to `CasdoorApiClient` are dictated by Casdoor's REST API
   * (external adapter boundary exception) — the translation happens ONLY here.
   */
  async getClient(): Promise<CasdoorApiClient | null> {
    if (this.initialized) return this.client;
    this.initialized = true;

    try {
      const cfg = await getAuthConfig();
      // idp_client_id / idp_client_secret are NOT in the
      // AuthConfig shape (they're only in AuthConfigDb). Read them via the DAL
      // directly when needed. For now, the cached config exposes idp_endpoint
      // and idp_organization; the admin credentials are read from DB on
      // first init.
      const { AuthConfigurationsDal } = await import("../auth_configurations_dal.js");
      const dal = new AuthConfigurationsDal(this.pool);
      const [clientIdRow, clientSecretRow] = await Promise.all([
        dal.findByKey("idp_client_id"),
        dal.findByKey("idp_client_secret"),
      ]);
      const adminClientId = clientIdRow?.value;
      const adminClientSecret = clientSecretRow?.value;
      if (!adminClientId || !adminClientSecret) {
        console.warn("[CasdoorService] Admin credentials not configured; skipping Casdoor sync");
        return null;
      }
      this.client = new CasdoorApiClient({
        endpoint: cfg.idp_endpoint!,
        orgName: cfg.idp_organization!,
        clientId: adminClientId,
        clientSecret: adminClientSecret,
      });
      return this.client;
    } catch (error) {
      console.error("[CasdoorService] Failed to create Casdoor API client:", error);
      return null;
    }
  }
}
