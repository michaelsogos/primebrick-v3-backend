/**
 * OAuth Client Registry DAL — DB-backed store for MCP OAuth 2.1 clients.
 *
 * Implements RFC 7591 Dynamic Client Registration storage.
 * Clients are stored in the `mcp_oauth_clients` table.
 */

import type { Pool } from "pg";

/** RFC 7591 client registration record. */
export interface OAuthClient {
  client_id: string;
  client_secret: string | null;
  client_name: string | null;
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
  scope: string;
  client_id_issued_at: Date;
  client_secret_expires_at: Date | null;
}

/** Row shape from the `mcp_oauth_clients` table. */
interface ClientRow {
  client_id: string;
  client_secret: string | null;
  client_name: string | null;
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
  scope: string;
  client_id_issued_at: Date;
  client_secret_expires_at: Date | null;
}

function rowToClient(row: ClientRow): OAuthClient {
  return {
    client_id: row.client_id,
    client_secret: row.client_secret,
    client_name: row.client_name,
    redirect_uris: row.redirect_uris ?? [],
    grant_types: row.grant_types ?? ["authorization_code", "refresh_token"],
    response_types: row.response_types ?? ["code"],
    token_endpoint_auth_method: row.token_endpoint_auth_method ?? "client_secret_post",
    scope: row.scope ?? "mcp:tools",
    client_id_issued_at: row.client_id_issued_at,
    client_secret_expires_at: row.client_secret_expires_at,
  };
}

export class OAuthClientRegistryDal {
  constructor(private pool: Pool) {}

  /** Find a client by client_id. Returns null if not found. */
  async findByClientId(clientId: string): Promise<OAuthClient | null> {
    const result = await this.pool.query<ClientRow>(
      `SELECT client_id, client_secret, client_name, redirect_uris,
              grant_types, response_types, token_endpoint_auth_method, scope,
              client_id_issued_at, client_secret_expires_at
       FROM mcp_oauth_clients
       WHERE client_id = $1`,
      [clientId],
    );
    if (result.rows.length === 0) return null;
    return rowToClient(result.rows[0]);
  }

  /** Create a new client registration. */
  async create(client: OAuthClient): Promise<OAuthClient> {
    await this.pool.query(
      `INSERT INTO mcp_oauth_clients
        (client_id, client_secret, client_name, redirect_uris, grant_types,
         response_types, token_endpoint_auth_method, scope, client_id_issued_at,
         client_secret_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        client.client_id,
        client.client_secret,
        client.client_name,
        JSON.stringify(client.redirect_uris),
        JSON.stringify(client.grant_types),
        JSON.stringify(client.response_types),
        client.token_endpoint_auth_method,
        client.scope,
        client.client_id_issued_at,
        client.client_secret_expires_at,
      ],
    );
    return client;
  }

  /** Delete a client by client_id. Returns true if deleted, false if not found. */
  async deleteByClientId(clientId: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM mcp_oauth_clients WHERE client_id = $1`,
      [clientId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
