/**
 * `public.mcp_oauth_clients` — RFC 7591 Dynamic Client Registration store
 * for the MCP OAuth 2.1 server (Claude Desktop, Cursor, VS Code clients).
 *
 * Plain (non-auditable) entity — the DDL carries `version` + timestamps but
 * no `*_by` actor columns; registration churn is low and rows are deleted
 * physically on client removal.
 */
import { Column, Entity, Key, Unique,
  type UUID,
} from "@primebrick/dal-pg";

@Entity("mcp_oauth_clients")
export class McpOauthClientEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: UUID;

  @Unique()
  @Column({ length: 255, nullable: false })
  client_id: string;

  @Column({ nullable: true })
  client_secret?: string | null;

  @Column({ length: 255, nullable: true })
  client_name?: string | null;

  @Column({ pgType: "jsonb", nullable: true })
  redirect_uris?: string[];

  @Column({ pgType: "jsonb", nullable: true })
  grant_types?: string[];

  @Column({ pgType: "jsonb", nullable: true })
  response_types?: string[];

  @Column({ length: 50, nullable: true })
  token_endpoint_auth_method?: string;

  @Column({ nullable: true })
  scope?: string;

  @Column({ nullable: true })
  client_id_issued_at?: Date;

  @Column({ nullable: true })
  client_secret_expires_at?: Date | null;

  /** NOT NULL + `now()` default in DDL — always present on read, DB-fills on write. */
  @Column({ nullable: false })
  created_at: Date;

  @Column({ nullable: false })
  updated_at: Date;

  /** DDL-compat version column — plain entity, no audit semantics (int4 per
   *  the audit-column contract; explicit pgType because `number`→float8).
   *  NOT NULL + default `1` in DDL. */
  @Column({ pgType: "int4", nullable: false })
  version: number;
}
