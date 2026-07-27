/**
 * Ogni campo "dato" sul prototype è una colonna con lo stesso nome SQL (es. `first_name` → `first_name`).
 * Il decoratore `@Column` serve solo per override (`pgType`, `sqlName`, `nullable`).
 *
 * Il suffisso `!` è richiesto da TypeScript (`strictPropertyInitialization`): indica che i valori
 * vengono assegnati dal layer di hydration / DAL, non alla dichiarazione della classe.
 */
import type { IAuditableEntity, IExposableEntity, IClonableEntity } from "@primebrick/dal-pg";
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
  uuid: string;

  @Column({ length: 20, nullable: false })
  code: string;

  first_name?: string;

  last_name?: string;

  company_name?: string;

  @Column({ length: 320 })
  email?: string;

  @Column({ length: 64 })
  phone?: string;

  /** Union alias → metadata `Object`; NOT NULL esplicito per DDL */
  @Column({ nullable: false })
  status: CustomerStatus;

  status_reason?: string;

  local_address?: string;

  local_city?: string;

  local_state?: string;

  local_country?: string;

  local_zip?: string;

  /**
   * Customer onboarding instant, stored as `timestamptz` (UTC in PostgreSQL).
   * Pair with {@link onboarding_time_zone} so the UI can format in the creator IANA zone (incl. DST).
   */
  onboarding_at?: Date;

  /** IANA time zone id (e.g. `Europe/Rome`) captured when onboarding was recorded. */
  @Column({ length: 100 })
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

  @CloneField()
  cloned_from?: string;
}
