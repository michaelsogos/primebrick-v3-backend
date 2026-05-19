import type { IAuditableEntity } from "../../domain/entities/iauditable_entity.js";
import { Entity, Key, Column, Unique, AuditableField, AuditableFieldType, AuditTrail } from "../../domain/entities/entity-meta.js";

/**
 * Maps IDP roles (from JWT) to Primebrick permissions.
 *
 * This table is the single source of truth for role-to-permission mappings.
 * The frontend will provide a UI to manage these mappings.
 *
 * Design:
 *   - idp_role: The exact role name as emitted by the IDP in the JWT (case-sensitive)
 *   - permissions: JSON array of permission strings (e.g. ["customers:list", "customers:read"])
 *   - is_admin: When true, this role grants ALL permissions (super-user)
 *   - created_by/updated_by: Audit fields populated via AsyncLocalStorage
 */
@Entity("role_mappings")
@AuditTrail()
export class RoleMappingEntity implements IAuditableEntity {
  @Key()
  id!: string;

  @Unique()
  @Column({ length: 255, nullable: false })
  idp_role!: string;

  @Column({ pgType: "jsonb", nullable: false })
  permissions!: string[];

  @Column({ nullable: false })
  is_admin!: boolean;

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
