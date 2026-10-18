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


import type { UUID } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  Unique,
  SynchronizableField,
  SynchronizableFieldType,
  AuditTrail,
  EntityBase,
  Auditable,
  Deletable,
} from "@primebrick/dal-pg";
import { Cached } from "@primebrick/sdk";

@Entity("organizations")
@AuditTrail()
@Cached(300_000) // 5 min TTL — mutable (Casdoor sync)
export class OrganizationEntity
  extends Deletable(Auditable(EntityBase)) {
  @Key()
  id: bigint;

  @Unique()
  uuid: UUID; // Internal Primebrick UUID (used for all operations, audit fields, API endpoints)

  @Unique()
  @Column({ length: 255, nullable: false })
  idp_code: string; // Casdoor organization ID in owner/name format (e.g., "admin/acme") - external identifier for sync

  @Column({ length: 255, nullable: true })
  idp_owner?: string; // Casdoor organization owner (e.g., "admin")

  @Column({ length: 255, nullable: true })
  idp_name?: string; // Casdoor organization name (e.g., "acme")

  @Column({ length: 255, nullable: true })
  display_name?: string;

  @Column({ length: 2048, nullable: true })
  website_url?: string;

  @Column({ nullable: true })
  avatar?: string;

  @SynchronizableField(SynchronizableFieldType.LAST_SYNCED_AT)
  @Column({ nullable: true })
  last_synced_at?: Date;

  // Audit fields (NOT synced to Casdoor)






}
