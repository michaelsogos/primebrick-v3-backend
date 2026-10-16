/**
 * `public.api_keys` — machine-to-machine credentials mapped to RBAC
 * permissions (client shield). `is_system` marks keys whose actor resolves
 * to "system" bypassing RBAC.
 *
 * Auditable (version + audit stamps) but NOT deletable — no `deleted_at`;
 * revocation is `is_active = false` or hard delete.
 */
import type { IAuditableEntity, UUID } from "@primebrick/dal-pg";
import {
  AuditableField,
  AuditableFieldType,
  Column,
  Entity,
  Key,
  Unique,
} from "@primebrick/dal-pg";

@Entity("api_keys")
export class ApiKeyEntity implements IAuditableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: UUID;

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

  @Column({ pgType: "jsonb", nullable: true })
  permissions?: string[];

  @Column({ pgType: "boolean", nullable: true })
  is_system?: boolean;

  @Column({ pgType: "boolean", nullable: true })
  is_active?: boolean;

  @Column({ nullable: true })
  expires_at?: Date | null;

  @AuditableField(AuditableFieldType.CREATED_AT)
  created_at: Date;

  @AuditableField(AuditableFieldType.CREATED_BY)
  created_by: string;

  @AuditableField(AuditableFieldType.UPDATED_AT)
  updated_at: Date;

  @AuditableField(AuditableFieldType.UPDATED_BY)
  updated_by: string;

  @AuditableField(AuditableFieldType.VERSION)
  version: number;
}
