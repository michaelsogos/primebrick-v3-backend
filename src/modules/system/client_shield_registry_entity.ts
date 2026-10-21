import type { UUID } from "@primebrick/dal-pg";
import { Column, Entity, Key, Unique, EntityBase, Auditable, Deletable } from "@primebrick/dal-pg";

@Entity("client_shield_registry", "system")
export class ClientShieldRegistryEntity extends Deletable(Auditable(EntityBase)) {
  @Key()
  id: bigint;

  @Unique()
  uuid: UUID;

  @Unique()
  @Column({ length: 255, nullable: false })
  ua_prefix: string;

  @Column({ length: 255, nullable: false })
  client_key_hash: string;

  @Column({ length: 20, nullable: false, defaultSql: "'manual'" })
  source: string;

  @Column({ nullable: false, defaultSql: "true" })
  is_enabled: boolean;

  /** 'static' = key set directly (manual rows, legacy services); 'derived' = HMAC(derivation_secret, ua_prefix:generation). */
  @Column({ length: 10, nullable: false, defaultSql: "'static'" })
  key_mode: string;

  /** Monotonic counter bumped on rotate for derived rows — services re-derive HMAC(secret, prefix:generation). */
  @Column({ pgType: "int4", nullable: false, defaultSql: "0" })
  key_generation: number;

  /** Old hash kept valid during the post-rotation grace window. */
  @Column({ length: 255, nullable: true })
  previous_key_hash?: string;

  /** Grace end — previous_key_hash is rejected after this instant. */
  @Column({ nullable: true })
  previous_valid_until?: Date;

  @Column({ nullable: true })
  key_rotated_at?: Date;
}
