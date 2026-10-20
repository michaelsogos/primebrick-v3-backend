
import type { UUID } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  Unique,
  EntityBase,
  Auditable,
  Deletable,
} from "@primebrick/dal-pg";

/**
 * ServiceRegistryEntity — `public.service_registry`.
 *
 * Deletable: `service.unregister` / admin delete soft-delete the row —
 * a removed service follows the default arch rule (query system
 * auto-excludes `deleted_at` rows: module switcher, NATS routing gate and
 * schema-ownership checks all stop seeing it). `hardDelete*` remains for
 * admin purge. `is_enabled`/`status` are operational axes (admin toggle /
 * liveness) and are intentionally NOT conflated with deletion.
 */
@Entity("service_registry")
export class ServiceRegistryEntity
  extends Deletable(Auditable(EntityBase)) {
  @Key()
  id: bigint;

  @Unique()
  uuid: UUID;

  @Column({ length: 100, nullable: false })
  code: string;

  @Column({ nullable: false })
  base_url: string;

  /**
   * ROOT LEVEL the module belongs to (`part of`) — 'system' for platform
   * services, 'crm' for the CRM domain, … Combined with `code` it derives
   * the module's route prefix `/{part_of}/{code}`; service.register
   * validates every declared route_prefix/nav href/route against it.
   */
  @Column({ nullable: false })
  part_of: string;

  @Column({ nullable: false })
  endpoints: Record<string, unknown>;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  author?: string;

  @Column({ nullable: true })
  github_repo_url?: string;

  @Column({ nullable: true })
  service_version?: string;

  /** Package name from the service's package.json (e.g. `primebrick-ai`) — with service_version it forms the canonical identity `{pkg_name}/{version}` used in client_shield_registry and logs. */
  @Column({ nullable: true })
  pkg_name?: string;

  /** Capabilities declared in the service's package.json, refreshed at every service.register (e.g. ["llm_orchestrator","vectorizing_engine"]). */
  @Column({ pgType: "jsonb", nullable: false, defaultSql: "'[]'" })
  capabilities: string[];

  /** PG schema ownership claim from the service's DATABASE_SCHEMA env contract (first = owned schema). The BE rejects registration when a claimed schema is owned by a different code or is a platform schema. Claim persists while the row exists — released by unregister or admin purge only. */
  @Column({ nullable: false, defaultSql: "'{}'" })
  schemas: string[];

  @Column({ nullable: false, defaultSql: "false" })
  is_behind_scaler: boolean;

  @Column({ nullable: false, defaultSql: "'unknown'" })
  status: string;

  @Column({ nullable: true })
  last_health_check_at?: Date;

  @Column({ nullable: false, defaultSql: "true" })
  is_enabled: boolean;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: false, defaultSql: "'icon'" })
  icon_type: string;

  @Column({ nullable: false, defaultSql: "false" })
  is_reserved: boolean;





}
