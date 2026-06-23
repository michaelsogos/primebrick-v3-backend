/**
 * `organizations` — Primebrick-side mirror of Casdoor organizations.
 *
 * Why this table exists:
 *   - The Casdoor organization name (referred to as `idp_code` here) is the
 *     external identifier used for Casdoor API calls. To keep the API surface
 *     IDP-agnostic and to avoid leaking external IDs in audit fields
 *     (`created_by`, `updated_by`, ...), we generate our own internal `uuid`
 *     per organization and use *only* that across the application.
 *
 * Resolution flow:
 *   - `uuid` is used for all internal operations (Repository, API endpoints, audit fields)
 *   - `idp_code` is used for Casdoor synchronization (external identifier)
 *   - `idp_code` is immutable after creation (one-to-one mapping with Casdoor)
 */

import type { IAuditableEntity } from "../../domain/entities/iauditable_entity.js";
import {
  Column,
  Entity,
  Key,
  Unique,
  AuditableField,
  AuditableFieldType,
  DeletableField,
  DeletableFieldType,
  SynchronizableField,
  SynchronizableFieldType,
  AuditTrail,
} from "../../domain/entities/entity-meta.js";

@Entity("organizations")
@AuditTrail()
export class OrganizationEntity implements IAuditableEntity {
  @Key()
  id: number;

  @Unique()
  uuid: string; // Internal Primebrick UUID (used for all operations, audit fields, API endpoints)

  @Unique()
  @Column({ length: 255, nullable: false })
  idp_code: string; // Casdoor organization ID in owner/name format (e.g., "admin/acme") - external identifier for sync

  @Column({ length: 255, nullable: true })
  idp_owner?: string; // Casdoor organization owner (e.g., "admin")

  @Column({ length: 255, nullable: true })
  idp_name?: string; // Casdoor organization name (e.g., "acme")

  @Column({ length: 255 })
  display_name?: string;

  @Column({ length: 2048 })
  website_url?: string;

  @Column({ pgType: "text", nullable: true })
  avatar?: string;

  @SynchronizableField(SynchronizableFieldType.LAST_SYNCED_AT)
  @Column({ pgType: "timestamp with time zone", nullable: true })
  last_synced_at?: Date;

  // Audit fields (NOT synced to Casdoor)
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

  @DeletableField(DeletableFieldType.DELETED_AT)
  deleted_at?: Date;

  @DeletableField(DeletableFieldType.DELETED_BY)
  deleted_by?: string;
}
