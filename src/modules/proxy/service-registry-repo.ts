/**
 * Service registry repository — reads/writes the `service_registry` table
 * using the DAL Repository pattern from @primebrick/dal-pg.
 *
 * NO raw SQL — all operations go through the Repository's entity-based API.
 */

import { Repository, Project, field, Filter } from "@primebrick/dal-pg";
import type { Pool } from "pg";
import { ServiceRegistryEntity } from "../system/service_registry_entity.js";

export interface ServiceRegistryEntry {
  code: string;
  base_url: string;
  endpoints: Record<string, unknown>;
  name?: string;
  description?: string;
  author?: string;
  github_repo_url?: string;
  service_version?: string;
  is_behind_scaler: boolean;
  status: string;
  last_health_check_at?: Date;
  uuid?: string;
}

export class ServiceRegistryRepo {
  private repo: Repository;

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
  }

  async findByCode(code: string): Promise<ServiceRegistryEntry | null> {
    return this.repo.find<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      this.fullProjection(),
      {
        filters: [Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code)],
        throwIfNotFound: false,
      },
    );
  }

  async findAllByCode(code: string): Promise<ServiceRegistryEntry[]> {
    const rows = await this.repo.findAll<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      this.fullProjection(),
      {
        filters: [Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code)],
      },
    );
    return rows as ServiceRegistryEntry[];
  }

  async findByCodeAndBaseUrl(code: string, baseUrl: string): Promise<ServiceRegistryEntry | null> {
    return this.repo.find<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      this.fullProjection(),
      {
        filters: [
          Filter.fieldValue(field(ServiceRegistryEntity, "code" as any), "=", code),
          Filter.fieldValue(field(ServiceRegistryEntity, "base_url" as any), "=", baseUrl),
        ],
        throwIfNotFound: false,
      },
    );
  }

  async findAll(): Promise<ServiceRegistryEntry[]> {
    const rows = await this.repo.findAll<ServiceRegistryEntity, ServiceRegistryEntry>(
      ServiceRegistryEntity,
      this.fullProjection(),
    );
    return rows as ServiceRegistryEntry[];
  }

  async insert(row: Partial<ServiceRegistryEntry>): Promise<void> {
    await this.repo.add(ServiceRegistryEntity, row as any, { actor: "system" });
  }

  async updateByCode(code: string, row: Partial<ServiceRegistryEntry>): Promise<void> {
    await this.repo.update(
      ServiceRegistryEntity,
      { code, ...row } as any,
      { actor: "system", matchBy: "code" },
    );
  }

  async updateByCodeAndBaseUrl(code: string, baseUrl: string, row: Partial<ServiceRegistryEntry>): Promise<void> {
    // DAL update matches by a single column. Find the row first to get its UUID,
    // then update by UUID. This avoids raw SQL while supporting composite key lookup.
    const existing = await this.findByCodeAndBaseUrl(code, baseUrl);
    if (!existing || !existing.uuid) {
      throw new Error(`Service registry row not found for code=${code}, base_url=${baseUrl}`);
    }
    await this.repo.update(
      ServiceRegistryEntity,
      { uuid: existing.uuid, ...row } as any,
      { actor: "system", matchBy: "uuid" },
    );
  }

  async deleteByCodeAndBaseUrl(code: string, baseUrl: string): Promise<void> {
    const existing = await this.findByCodeAndBaseUrl(code, baseUrl);
    if (!existing || !existing.uuid) return;
    await this.repo.hardDelete(
      ServiceRegistryEntity,
      { uuid: existing.uuid } as any,
      { actor: "system", matchBy: "uuid" },
    );
  }

  private fullProjection() {
    return [
      Project.field(field(ServiceRegistryEntity, "code" as any)),
      Project.field(field(ServiceRegistryEntity, "base_url" as any)),
      Project.field(field(ServiceRegistryEntity, "endpoints" as any)),
      Project.field(field(ServiceRegistryEntity, "name" as any)),
      Project.field(field(ServiceRegistryEntity, "description" as any)),
      Project.field(field(ServiceRegistryEntity, "author" as any)),
      Project.field(field(ServiceRegistryEntity, "github_repo_url" as any)),
      Project.field(field(ServiceRegistryEntity, "service_version" as any)),
      Project.field(field(ServiceRegistryEntity, "is_behind_scaler" as any)),
      Project.field(field(ServiceRegistryEntity, "status" as any)),
      Project.field(field(ServiceRegistryEntity, "last_health_check_at" as any)),
      Project.field(field(ServiceRegistryEntity, "uuid" as any)),
    ];
  }
}
