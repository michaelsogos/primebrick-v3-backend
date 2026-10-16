/**
 * OAuthClientService — client-registry access for the OAuth 2.1 endpoints.
 *
 * Domain service for the `mcp_oauth_clients` table (McpOauthClientEntity) —
 * RFC 7591 Dynamic Client Registration storage. The ONLY place these rows
 * are read/written; data access is `getDal()` proxies (entity ops,
 * schema-domain guarded) — the MCP controllers never touch a DAL.
 */

import { field, Filter, Project } from "@primebrick/dal-pg";

import {getDal} from "../../../db/dal-gateway.js";
import { McpOauthClientEntity } from "./mcp_oauth_client_entity.js";

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

const CLIENT_FIELDS = (
  ["client_id", "client_secret", "client_name", "redirect_uris", "grant_types",
    "response_types", "token_endpoint_auth_method", "scope",
    "client_id_issued_at", "client_secret_expires_at"] as const
).map((k) => Project.field(field(McpOauthClientEntity, k)));

function rowToClient(row: Partial<McpOauthClientEntity>): OAuthClient {
  return {
    client_id: row.client_id!,
    client_secret: row.client_secret ?? null,
    client_name: row.client_name ?? null,
    redirect_uris: row.redirect_uris ?? [],
    grant_types: row.grant_types ?? ["authorization_code", "refresh_token"],
    response_types: row.response_types ?? ["code"],
    token_endpoint_auth_method: row.token_endpoint_auth_method ?? "client_secret_post",
    scope: row.scope ?? "mcp:tools",
    client_id_issued_at: row.client_id_issued_at!,
    client_secret_expires_at: row.client_secret_expires_at ?? null,
  };
}

export class OAuthClientService {
  /** Find a client by client_id. Returns null if not found. */
  async findByClientId(clientId: string): Promise<OAuthClient | null> {
    const row = await getDal().find<McpOauthClientEntity>(
      McpOauthClientEntity,
      CLIENT_FIELDS,
      {
        filters: [Filter.fieldValue(field(McpOauthClientEntity, "client_id"), "=", clientId)],
        throwIfNotFound: false,
      },
    );
    return row ? rowToClient(row) : null;
  }

  /** Create a new client registration. */
  async register(client: OAuthClient): Promise<OAuthClient> {
    await getDal().add(McpOauthClientEntity, {
      client_id: client.client_id,
      client_secret: client.client_secret,
      client_name: client.client_name,
      redirect_uris: client.redirect_uris,
      grant_types: client.grant_types,
      response_types: client.response_types,
      token_endpoint_auth_method: client.token_endpoint_auth_method,
      scope: client.scope,
      client_id_issued_at: client.client_id_issued_at,
      client_secret_expires_at: client.client_secret_expires_at,
    }, {});
    return client;
  }

  /** Delete a client by client_id. Returns true if deleted, false if not found. */
  async deleteByClientId(clientId: string): Promise<boolean> {
    const res = await getDal().hardDeleteMany(
      McpOauthClientEntity,
      [{ client_id: clientId }],
      { matchBy: "client_id" },
    );
    return res.affected > 0;
  }
}
