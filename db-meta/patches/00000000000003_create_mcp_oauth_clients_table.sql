-- Primebrick: mcp_oauth_clients table for MCP OAuth 2.1 Dynamic Client Registration (RFC 7591).
-- Stores OAuth clients registered by AI clients (Claude Desktop, Cursor, VS Code)
-- via the MCP server's DCR endpoint. These clients are used for the authorization
-- code flow that issues Casdoor JWTs scoped to the MCP server.

CREATE TABLE IF NOT EXISTS "public"."mcp_oauth_clients" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "client_id" varchar(255) NOT NULL,
  "client_secret" text,
  "client_name" varchar(255),
  "redirect_uris" jsonb DEFAULT '[]',
  "grant_types" jsonb DEFAULT '["authorization_code","refresh_token"]',
  "response_types" jsonb DEFAULT '["code"]',
  "token_endpoint_auth_method" varchar(50) DEFAULT 'client_secret_post',
  "scope" text DEFAULT 'mcp:tools',
  "client_id_issued_at" timestamptz DEFAULT now(),
  "client_secret_expires_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "mcp_oauth_clients_uuid_uq" ON "public"."mcp_oauth_clients" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "mcp_oauth_clients_client_id_uq" ON "public"."mcp_oauth_clients" ("client_id");
