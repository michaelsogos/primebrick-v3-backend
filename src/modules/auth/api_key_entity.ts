/**
 * `public.api_keys` — machine-to-machine credentials mapped to RBAC
 * permissions (client shield). `is_system` marks keys whose actor resolves
 * to "system" bypassing RBAC.
 *
 * Auditable (version + audit stamps) but NOT deletable — no `deleted_at`;
 * revocation is `is_active = false` or hard delete.
 */

import type { UUID } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  PublicEntity,
  Key,
  Unique,
  EntityBase,
  Auditable,
} from "@primebrick/dal-pg";

@PublicEntity("api_keys")
export class ApiKeyEntity
  extends Auditable(EntityBase) {
  @Key()
  @Column({ pgType: "uuid" })
  uuid!: UUID;

  /** SHA-256 of the presented key — the lookup selector, never the key itself. */
  @Unique()
  @Column({ nullable: false })
  key_hash: string;

  @Column({ length: 20, nullable: false })
  key_prefix: string;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ nullable: true })
  description?: string | null;

  @Column({ pgType: "jsonb", nullable: false, defaultSql: "'[]'::jsonb" })
  permissions!: string[];

  @Column({ pgType: "boolean", nullable: false, defaultSql: "false" })
  is_system!: boolean;

  @Column({ pgType: "boolean", nullable: false, defaultSql: "false" })
  is_active!: boolean;

  @Column({ nullable: true, jsType: "instant" })
  expires_at?: Date | null;





}
