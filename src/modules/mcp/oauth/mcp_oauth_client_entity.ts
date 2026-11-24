/**
 * `public.mcp_oauth_clients` — RFC 7591 Dynamic Client Registration store
 * for the MCP OAuth 2.1 server (Claude Desktop, Cursor, VS Code clients).
 *
 * Auditable entity (no soft-delete — rows are physically deleted on client
 * removal). `created_by`/`updated_by` record the registering admin.
 */
import { Column,
  PublicEntity, Key, Unique,
  Auditable, EntityBase,
  type UUID,
} from "@primebrick/dal-pg";

@PublicEntity("mcp_oauth_clients")
export class McpOauthClientEntity extends Auditable(EntityBase) {
  @Key()
  @Column({ pgType: "uuid" })
  uuid!: UUID;

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

  /** DB-fills with `now()` on registration insert when not passed. */
  @Column({ nullable: true, jsType: "instant", defaultSql: "clock_timestamp()" })
  client_id_issued_at?: Date;

  @Column({ nullable: true, jsType: "instant" })
  client_secret_expires_at?: Date | null;
}
