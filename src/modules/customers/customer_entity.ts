/**
 * Ogni campo "dato" sul prototype è una colonna con lo stesso nome SQL (es. `first_name` → `first_name`).
 * Il decoratore `@Column` serve solo per override (`pgType`, `sqlName`, `nullable`).
 *
 * Il suffisso `!` è richiesto da TypeScript (`strictPropertyInitialization`): indica che i valori
 * vengono assegnati dal layer di hydration / DAL, non alla dichiarazione della classe.
 */
import type { IAuditableEntity, IExposableEntity, IClonableEntity, UUID } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  Unique,
  AuditableField,
  DeletableField,
  CloneField,
  AuditableFieldType,
  DeletableFieldType,
  AuditTrail
} from "@primebrick/dal-pg";
import { Cached } from "@primebrick/sdk";

export type CustomerStatus = "ACTIVE" | "INACTIVE";

@Entity("customers")
@AuditTrail()
@Cached(300_000) // 5 min TTL — mutable business data
export class CustomerEntity implements IAuditableEntity, IExposableEntity, IClonableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: UUID;

  @Column({ length: 20, nullable: false })
  code: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  company_name?: string;

  @Column({ length: 320, nullable: true })
  email?: string;

  @Column({ length: 64, nullable: true })
  phone?: string;

  /** Union alias — NOT NULL esplicito per DDL */
  @Column({ nullable: false })
  status: CustomerStatus;

  @Column({ nullable: true })
  status_reason?: string;

  @Column({ nullable: true })
  local_address?: string;

  @Column({ nullable: true })
  local_city?: string;

  @Column({ nullable: true })
  local_state?: string;

  @Column({ nullable: true })
  local_country?: string;

  @Column({ nullable: true })
  local_zip?: string;

  /**
   * Customer onboarding instant, stored as `timestamptz` (UTC in PostgreSQL).
   * Pair with {@link onboarding_time_zone} so the UI can format in the creator IANA zone (incl. DST).
   */
  @Column({ nullable: true })
  onboarding_at?: Date;

  /** IANA time zone id (e.g. `Europe/Rome`) captured when onboarding was recorded. */
  @Column({ length: 100, nullable: true })
  onboarding_time_zone?: string;

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

  @Column({ pgType: "uuid", nullable: true })
  @CloneField()
  cloned_from?: string;
}
