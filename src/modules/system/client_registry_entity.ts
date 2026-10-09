import type { IAuditableEntity } from "@primebrick/dal-pg";
import { Column, Entity, Key, Unique } from "@primebrick/dal-pg";

@Entity("client_registry", "system")
export class ClientRegistryEntity implements IAuditableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: string;

  @Column({ nullable: false })
  ua_prefix: string;

  @Column({ nullable: false })
  client_key_hash: string;

  @Column({ nullable: false, defaultSql: "'manual'" })
  source: string;

  @Column({ pgType: "boolean", nullable: false, defaultSql: "true" })
  is_enabled: boolean;

  @Column({ pgType: "timestamptz", nullable: false, defaultSql: "now()" })
  created_at: Date;

  @Column({ nullable: false })
  created_by: string;

  @Column({ pgType: "timestamptz", nullable: false, defaultSql: "now()" })
  updated_at: Date;

  @Column({ nullable: false })
  updated_by: string;

  @Column({ nullable: false, defaultSql: "1" })
  version: number;

  @Column({ pgType: "timestamptz", nullable: true })
  deleted_at?: Date;

  @Column({ nullable: true })
  deleted_by?: string;
}
