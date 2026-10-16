/**
 * ServiceRegistryService — domain service for `system.service_registry`.
 *
 * The ONLY place service-registry rows are read/written. Every caller —
 * HTTP controllers, NATS subscribers, bootstrap, other services — goes
 * through this class; nobody constructs a Repository for these tables.
 * Data access is `getDal()` proxies (entity ops, schema-domain guarded);
 * composite lookups (code+base_url) and versioned updates live here as
 * domain rules, not in per-caller wrappers.
 */

import { Project, field, Filter } from "@primebrick/dal-pg";

import {getDal} from "../../db/dal-gateway.js";
import { ServiceRegistryEntity } from "./service_registry_entity.js";

export interface ServiceRegistryEntry {
  code: string;
  base_url: string;
  endpoints: Record<string, unknown>;
  name?: string;
  description?: string;
  author?: string;
  github_repo_url?: string;
  service_version?: string;
  pkg_name?: string;
  capabilities?: string[];
  schemas?: string[];
  is_behind_scaler: boolean;
  status: string;
  last_health_check_at?: Date;
  created_at?: Date;
  is_enabled: boolean;
  icon?: string;
  icon_type: string;
  is_reserved: boolean;
  uuid?: string;
  version?: number;
}

const FULL_PROJECTION = [
  Project.field(field(ServiceRegistryEntity, "code" as any)),
  Project.field(field(ServiceRegistryEntity, "base_url" as any)),
  Project.field(field(ServiceRegistryEntity, "endpoints" as any)),
  Project.field(field(ServiceRegistryEntity, "name" as any)),
  Project.field(field(ServiceRegistryEntity, "description" as any)),
  Project.field(field(ServiceRegistryEntity, "author" as any)),
  Project.field(field(ServiceRegistryEntity, "github_repo_url" as any)),
  Project.field(field(ServiceRegistryEntity, "service_version" as any)),
  Project.field(field(ServiceRegistryEntity, "pkg_name" as any)),
  Project.field(field(ServiceRegistryEntity, "capabilities" as any)),
  Project.field(field(ServiceRegistryEntity, "schemas" as any)),
  Project.field(field(ServiceRegistryEntity, "is_behind_scaler" as any)),
  Project.field(field(ServiceRegistryEntity, "status" as any)),
  Project.field(field(ServiceRegistryEntity, "last_health_check_at" as any)),
  Project.field(field(ServiceRegistryEntity, "created_at" as any)),
  Project.field(field(ServiceRegistryEntity, "is_enabled" as any)),
  Project.field(field(ServiceRegistryEntity, "icon" as any)),
  Project.field(field(ServiceRegistryEntity, "icon_type" as any)),
  Project.field(field(ServiceRegistryEntity, "is_reserved" as any)),
  Project.field(field(ServiceRegistryEntity, "uuid" as any)),
  Project.field(field(ServiceRegistryEntity, "version" as any)),
];

export class ServiceRegistryService {
  async findByCode(code: string): Promise<ServiceRegistryEntry | null> {
    return getDal().find<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      {
        filters: [Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code)],
        throwIfNotFound: false,
      },
    );
  }

  async findAllByCode(code: string): Promise<ServiceRegistryEntry[]> {
    const rows = await getDal().findAll<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      {
        filters: [Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code)],
      },
    );
    return rows as ServiceRegistryEntry[];
  }

  async findByCodeAndBaseUrl(code: string, baseUrl: string): Promise<ServiceRegistryEntry | null> {
    return getDal().find<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      {
        filters: [
          Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code),
          Filter.fieldValue(field(ServiceRegistryEntity, "base_url" as any), "=", baseUrl),
        ],
        throwIfNotFound: false,
      },
    );
  }

  async findByUuid(uuid: string): Promise<ServiceRegistryEntry | null> {
    return getDal().find<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      {
        filters: [Filter.fieldValue(field(ServiceRegistryEntity, "uuid" as any), "=", uuid)],
        throwIfNotFound: false,
      },
    );
  }

  async findAll(): Promise<ServiceRegistryEntry[]> {
    const rows = await getDal().findAll<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
    );
    return rows as ServiceRegistryEntry[];
  }

  async insert(row: Partial<ServiceRegistryEntry>): Promise<void> {
    await getDal().add(ServiceRegistryEntity, row as any, { actor: "system" });
  }

  async updateByCode(code: string, row: Partial<ServiceRegistryEntry>): Promise<void> {
    const existing = await this.findByCode(code);
    if (!existing) return;
    await getDal().update(
      ServiceRegistryEntity,
      { code, ...row, version: existing.version } as any,
      { actor: "system", matchBy: "code" },
    );
  }

  async updateByCodeAndBaseUrl(code: string, baseUrl: string, row: Partial<ServiceRegistryEntry>): Promise<void> {
    // DAL update matches by a single column. Find the row first to get its
    // UUID, then update by UUID — composite key lookup without raw SQL.
    const existing = await this.findByCodeAndBaseUrl(code, baseUrl);
    if (!existing || !existing.uuid) {
      throw new Error(`Service registry row not found for code=${code}, base_url=${baseUrl}`);
    }
    await getDal().update(
      ServiceRegistryEntity,
      { uuid: existing.uuid, ...row, version: existing.version } as any,
      { actor: "system" },
    );
  }

  async deleteByCodeAndBaseUrl(code: string, baseUrl: string): Promise<void> {
    const existing = await this.findByCodeAndBaseUrl(code, baseUrl);
    if (!existing || !existing.uuid) return;
    await getDal().hardDelete(
      ServiceRegistryEntity,
      { uuid: existing.uuid, version: existing.version } as any,
      { actor: "system" },
    );
  }

  async hardDeleteByUuid(uuid: string): Promise<void> {
    const existing = await this.findByUuid(uuid);
    if (!existing || !existing.uuid) return;
    await getDal().hardDelete(
      ServiceRegistryEntity,
      { uuid: existing.uuid, version: existing.version } as any,
      { actor: "system" },
    );
  }

  async hardDeleteByCode(code: string): Promise<void> {
    const existing = await this.findByCode(code);
    if (!existing) return;
    await getDal().hardDelete(
      ServiceRegistryEntity,
      { code, version: existing.version } as any,
      { actor: "system", matchBy: "code" },
    );
  }

  async toggleEnabled(code: string, isEnabled: boolean): Promise<void> {
    const existing = await this.findByCode(code);
    if (!existing) return;
    await getDal().update(
      ServiceRegistryEntity,
      { code, is_enabled: isEnabled, version: existing.version } as any,
      { actor: "system", matchBy: "code" },
    );
  }

  async updateByCodeAdmin(code: string, row: Partial<ServiceRegistryEntry>): Promise<void> {
    const existing = await this.findByCode(code);
    if (!existing) return;
    await getDal().update(
      ServiceRegistryEntity,
      { code, ...row, version: existing.version } as any,
      { actor: "system", matchBy: "code" },
    );
  }
}
