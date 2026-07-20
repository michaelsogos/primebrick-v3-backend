import type { IAuditableEntity } from "@primebrick/dal-pg";
import { Entity, Key, Column, Unique, AuditableField, AuditableFieldType, SynchronizableField, SynchronizableFieldType, AuditTrail } from "@primebrick/dal-pg";

/**
 * Maps IDP roles (from JWT) to Primebrick permissions.
 *
 * This table is the single source of truth for role-to-permission mappings.
 * The frontend will provide a UI to manage these mappings.
 *
 * Design (follows the standard Primebrick entity key convention — see
 * `organization_entity.ts` and `user_profile_entity.ts`):
 *   - id:        Internal bigserial PK, NEVER exposed externally (FK joins only).
 *   - uuid:      Internal Primebrick UUID, used for all API endpoints, audit
 *                fields, and the FE EntityListTable uid. Generated on insert.
 *   - idp_role:  The exact role name as emitted by the IDP in the JWT
 *                (case-sensitive). The Casdoor unique key (analogous to
 *                `idp_code` on orgs/users). Immutable after creation.
 *   - idp_org:   The Casdoor organization/owner the role belongs to (selected from
 *                the org combobox in the FE role form). Stored for Casdoor sync
 *                purposes; the RBAC lookup is by idp_role alone (JWT roles_path
 *                provides role names as plain strings). Nullable for backward
 *                compat with existing seed rows.
 *   - permissions: JSON array of permission strings (e.g. ["customers:list", "customers:read"])
 *   - is_admin: When true, this role grants ALL permissions (super-user)
 *   - last_synced_at: When Casdoor was last successfully synced for this role
 *   - created_by/updated_by: Audit fields populated via AsyncLocalStorage
 *
 * NOTE: This entity uses HARD DELETE only (no `deleted_at`/`deleted_by`).
 * Rationale: Casdoor role deletion is irreversible — there is no Casdoor
 * "restore role" API. Soft-deleting locally + restoring would create IDP drift
 * (role exists locally but not in Casdoor). This is a deliberate, documented
 * deviation from the org/user soft-delete pattern.
 */
@Entity("role_mappings")
@AuditTrail()
export class RoleMappingEntity implements IAuditableEntity {
  @Key()
  id!: bigint;

  @Unique()
  uuid!: string; // Internal Primebrick UUID (used for all operations, audit fields, API endpoints)

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
