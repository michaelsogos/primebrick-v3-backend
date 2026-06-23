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
 *   and reused. If the DB config is missing the builtin credentials, the
 *   service returns `null` and logs a single warning (no spam on every call).
 */

import type { Pool } from "pg";
import { CasdoorApiClient } from "../casdoor-api-client.js";
import { loadAuthConfigFromDb } from "../config-repo.js";

export class CasdoorService {
  private client: CasdoorApiClient | null = null;
  private initialized = false;

  constructor(private pool: Pool) {}

  /**
   * Returns the lazily-initialized `CasdoorApiClient`, or `null` when Casdoor
   * builtin credentials are not configured (e.g. dev setups without IDP).
   *
   * The first call performs the DB + env lookup; subsequent calls return the
   * cached instance (or `null`) without re-querying.
   */
  async getClient(): Promise<CasdoorApiClient | null> {
    if (this.initialized) return this.client;
    this.initialized = true;

    try {
      const dbConfig = await loadAuthConfigFromDb(this.pool);
      if (!dbConfig.casdoorBuiltinClientId || !dbConfig.casdoorBuiltinClientSecret) {
        console.warn("[CasdoorService] Builtin credentials not configured; skipping Casdoor sync");
        return null;
      }
      this.client = new CasdoorApiClient({
        endpoint: dbConfig.casdoorEndpoint || process.env.CASDOOR_ENDPOINT || "http://localhost:8000",
        orgName: dbConfig.casdoorOrganization || "acme",
        clientId: dbConfig.casdoorBuiltinClientId,
        clientSecret: dbConfig.casdoorBuiltinClientSecret,
      });
      return this.client;
    } catch (error) {
      console.error("[CasdoorService] Failed to create Casdoor API client:", error);
      return null;
    }
  }
}
