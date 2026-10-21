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
  /** Root level the module belongs to — `/{part_of}/{code}` route prefix. */
  part_of: string;
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
  /** Declared default module of its root level — at most one per part_of. */
  is_default: boolean;
  uuid?: string;
  version?: number;
  deleted_at?: Date | null;
}

const FULL_PROJECTION = [
  Project.field(field(ServiceRegistryEntity, "code" as any)),
  Project.field(field(ServiceRegistryEntity, "base_url" as any)),
  Project.field(field(ServiceRegistryEntity, "part_of" as any)),
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
  Project.field(field(ServiceRegistryEntity, "is_default" as any)),
  Project.field(field(ServiceRegistryEntity, "uuid" as any)),
  Project.field(field(ServiceRegistryEntity, "version" as any)),
  Project.field(field(ServiceRegistryEntity, "deleted_at" as any)),
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

  async findAllByCode(code: string, deletedRecords: "EXCLUDED" | "ONLY" | "INCLUDED" = "EXCLUDED"): Promise<ServiceRegistryEntry[]> {
    const rows = await getDal().findAll<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      {
        filters: [Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code)],
        deletedRecords,
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
    // `code` is pinned AFTER the row spread — identity is path-derived and
    // can never be overridden by payload content (defense in depth).
    await getDal().update(
      ServiceRegistryEntity,
      { ...row, code, version: existing.version } as any,
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
      { ...row, uuid: existing.uuid, version: existing.version } as any,
      { actor: "system" },
    );
  }

  /** Soft-deleted row lookup — for the register-restore path. */
  async findDeletedByCodeAndBaseUrl(code: string, baseUrl: string): Promise<ServiceRegistryEntry | null> {
    return getDal().find<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      {
        filters: [
          Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code),
          Filter.fieldValue(field(ServiceRegistryEntity, "base_url" as any), "=", baseUrl),
        ],
        deletedRecords: "ONLY",
        throwIfNotFound: false,
      },
    );
  }

  /** Soft-deleted row lookup by code — for the scaler register-restore path. */
  async findDeletedByCode(code: string): Promise<ServiceRegistryEntry | null> {
    return getDal().find<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      {
        filters: [Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code)],
        deletedRecords: "ONLY",
        throwIfNotFound: false,
      },
    );
  }

  /** Restore a soft-deleted registry row (unregister → re-register). */
  async restoreByUuid(uuid: string, version?: number): Promise<void> {
    await getDal().restore(
      ServiceRegistryEntity,
      { uuid, version } as any,
      { actor: "system" },
    );
  }

  /**
   * Soft-delete — the arch default for removal: the row becomes a tombstone,
   * every finder auto-excludes it (module switcher, NATS routing gate,
   * schema-ownership checks) and a later re-registration restores it.
   * `hardDelete*` survives for admin purge only.
   */
  async deleteByCodeAndBaseUrl(code: string, baseUrl: string): Promise<void> {
    const existing = await this.findByCodeAndBaseUrl(code, baseUrl);
    if (!existing || !existing.uuid) return;
    await getDal().delete(
      ServiceRegistryEntity,
      { uuid: existing.uuid, version: existing.version } as any,
      { actor: "system" },
    );
  }

  /** Soft-delete every row for a code (admin remove — tombstone, not purge). */
  async deleteByCode(code: string): Promise<void> {
    const existing = await this.findByCode(code);
    if (!existing) return;
    await getDal().delete(
      ServiceRegistryEntity,
      { code, version: existing.version } as any,
      { actor: "system", matchBy: "code" },
    );
  }

  /** Soft-delete one registry instance by uuid. */
  async deleteByUuid(uuid: string): Promise<void> {
    const existing = await this.findByUuid(uuid);
    if (!existing || !existing.uuid) return;
    await getDal().delete(
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

  /**
   * The enabled module currently holding `is_default` for a root level —
   * at most one per `part_of` by the keep-winner / demote-other rules.
   * `excludeCode` lets a claimant ignore its own row on re-registration.
   */
  async findDefaultHolder(partOf: string, excludeCode?: string): Promise<ServiceRegistryEntry | null> {
    const filters = [
      Filter.fieldValue(field(ServiceRegistryEntity, "part_of" as any), "=", partOf),
      Filter.fieldValue(field(ServiceRegistryEntity, "is_default" as any), "=", true),
      Filter.fieldValue(field(ServiceRegistryEntity, "is_enabled" as any), "=", true),
    ];
    if (excludeCode) {
      filters.push(Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "!=", excludeCode));
    }
    const rows = await getDal().findAll<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      { filters },
    );
    return rows[0] ?? null;
  }

  /** Demote every OTHER `is_default` holder under `partOf` — admin flip wins. */
  private async demoteOtherDefaults(partOf: string, winnerCode: string): Promise<void> {
    const holders = await getDal().findAll<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      FULL_PROJECTION,
      {
        filters: [
          Filter.fieldValue(field(ServiceRegistryEntity, "part_of" as any), "=", partOf),
          Filter.fieldValue(field(ServiceRegistryEntity, "is_default" as any), "=", true),
          Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "!=", winnerCode),
        ],
      },
    );
    for (const h of holders) {
      await getDal().update(
        ServiceRegistryEntity,
        { code: h.code, is_default: false, version: h.version } as any,
        { actor: "system", matchBy: "code" },
      );
    }
  }

  async updateByCodeAdmin(code: string, row: Partial<ServiceRegistryEntry>): Promise<void> {
    const existing = await this.findByCode(code);
    if (!existing) return;
    // `code` LAST — admin rows never carry identity; even if one slips
    // through validation it cannot rename the service.
    await getDal().update(
      ServiceRegistryEntity,
      { ...row, code, version: existing.version } as any,
      { actor: "system", matchBy: "code" },
    );
    if (row.is_default === true) {
      await this.demoteOtherDefaults(existing.part_of, code);
    }
  }
}
