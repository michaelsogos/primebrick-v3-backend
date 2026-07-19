import { Entity, Key, Column, Unique, AuditableField, AuditableFieldType, SynchronizableField, SynchronizableFieldType, AuditTrail } from "@primebrick/dal-pg";

/**
 * Maps IDP roles (from JWT) to Primebrick permissions.
 *
 * This table is the single source of truth for role-to-permission mappings.
 * The frontend will provide a UI to manage these mappings.
 *
 * Design:
 *   - idp_role: The exact role name as emitted by the IDP in the JWT (case-sensitive)
 *   - idp_org:  The Casdoor organization/owner the role belongs to (selected from
 *               the org combobox in the FE role form). Stored for Casdoor sync
 *               purposes; the RBAC lookup is by idp_role alone (JWT roles_path
 *               provides role names as plain strings). Nullable for backward
 *               compat with existing seed rows.
 *   - permissions: JSON array of permission strings (e.g. ["customers:list", "customers:read"])
 *   - is_admin: When true, this role grants ALL permissions (super-user)
 *   - last_synced_at: When Casdoor was last successfully synced for this role
 *   - created_by/updated_by: Audit fields populated via AsyncLocalStorage
 */
@Entity("role_mappings")
@AuditTrail()
export class RoleMappingEntity {
  @Key()
  id!: bigint;

  @Unique()
  @Column({ length: 255, nullable: false })
  idp_role!: string;

  @Column({ length: 255, nullable: true })
  idp_org?: string;

  @Column({ length: 255, nullable: true })
  label_key?: string;

  @Column({ pgType: "jsonb", nullable: false })
  permissions!: string[];

  @Column({ nullable: false })
  is_admin!: boolean;

  @SynchronizableField(SynchronizableFieldType.LAST_SYNCED_AT)
  @Column({ pgType: "timestamp with time zone", nullable: true })
  last_synced_at?: Date;

  @AuditableField(AuditableFieldType.CREATED_AT)
  created_at!: Date;

  @AuditableField(AuditableFieldType.CREATED_BY)
  created_by!: string;

  @AuditableField(AuditableFieldType.UPDATED_AT)
  updated_at!: Date;

  @AuditableField(AuditableFieldType.UPDATED_BY)
  updated_by!: string;

  @AuditableField(AuditableFieldType.VERSION)
  version!: number;
}
