/**
 * OAuthClientService — client-registry access for the OAuth 2.1 endpoints.
 *
 * Thin delegation to `OAuthClientRegistryDal`; exists so the MCP controllers
 * never hold a direct reference to the DAL layer (controller-boundary rule).
 */

import { getPool } from "../../../db/pool.js";
import { OAuthClientRegistryDal, type OAuthClient } from "./client-registry-dal.js";

export class OAuthClientService {
  async findByClientId(clientId: string): Promise<OAuthClient | null> {
    return new OAuthClientRegistryDal(getPool()).findByClientId(clientId);
  }

  async register(client: OAuthClient): Promise<OAuthClient> {
    return new OAuthClientRegistryDal(getPool()).create(client);
  }

  async deleteByClientId(clientId: string): Promise<boolean> {
    return new OAuthClientRegistryDal(getPool()).deleteByClientId(clientId);
  }
}
