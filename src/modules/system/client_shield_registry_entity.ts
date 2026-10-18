import { Column, Entity, Key, Unique, EntityBase, Auditable, Deletable } from "@primebrick/dal-pg";

@Entity("client_shield_registry", "system")
export class ClientShieldRegistryEntity extends Deletable(Auditable(EntityBase)) {
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
}
