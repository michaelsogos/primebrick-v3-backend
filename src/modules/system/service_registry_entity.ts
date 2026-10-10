import type { IAuditableEntity } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  Unique,
  AuditableField,
  AuditableFieldType,
} from "@primebrick/dal-pg";

@Entity("service_registry")
export class ServiceRegistryEntity implements IAuditableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: string;

  @Column({ length: 100, nullable: false })
  code: string;

  @Column({ nullable: false })
  base_url: string;

  @Column({ pgType: "jsonb", nullable: false })
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

  /** Package name from the service's package.json (e.g. `primebrick-ai`) — with service_version it forms the canonical identity `{pkg_name}/{version}` used in client_registry and logs. */
  @Column({ nullable: true })
  pkg_name?: string;

  /** Capabilities declared in the service's package.json, refreshed at every service.register (e.g. ["llm_orchestrator","vectorizing_engine"]). */
  @Column({ pgType: "jsonb", nullable: false, defaultSql: "'[]'" })
  capabilities: string[];

  @Column({ pgType: "boolean", nullable: false, defaultSql: "false" })
  is_behind_scaler: boolean;

  @Column({ nullable: false, defaultSql: "'unknown'" })
  status: string;

  @Column({ pgType: "timestamptz", nullable: true })
  last_health_check_at?: Date;

  @Column({ pgType: "boolean", nullable: false, defaultSql: "true" })
  is_enabled: boolean;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: false, defaultSql: "'icon'" })
  icon_type: string;

  @Column({ pgType: "boolean", nullable: false, defaultSql: "false" })
  is_reserved: boolean;

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
}
