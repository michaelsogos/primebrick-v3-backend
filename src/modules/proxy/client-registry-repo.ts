/**
 * Client registry repository — reads `system.client_registry` via the DAL
 * Repository pattern (no raw SQL).
 *
 * The table is the source of truth for the internal caller allowlist:
 * `source='registry'` rows are auto-maintained by the service lifecycle
 * subscriber (immutable to admins); `source='manual'` rows are admin-managed.
 */

import { Repository, Project, field, Filter } from "@primebrick/dal-pg";
import type { Pool } from "pg";
import { ClientRegistryEntity } from "../system/client_registry_entity.js";

export interface ClientRegistryRow {
  ua_prefix: string;
  client_key_hash: string;
  source: string;
  is_enabled: boolean;
  uuid?: string;
}

export class ClientRegistryRepo {
  private repo: Repository;

  constructor(private readonly pool: Pool) {
    this.repo = new Repository(pool);
  }

  private projection() {
    return [
      Project.field(field(ClientRegistryEntity, "uuid" as any)),
      Project.field(field(ClientRegistryEntity, "ua_prefix" as any)),
      Project.field(field(ClientRegistryEntity, "client_key_hash" as any)),
      Project.field(field(ClientRegistryEntity, "source" as any)),
      Project.field(field(ClientRegistryEntity, "is_enabled" as any)),
    ];
  }

  /** All enabled, non-deleted rows — the snapshot served to microservices. */
  async findAllEnabled(): Promise<ClientRegistryRow[]> {
    const rows = await this.repo.findAll<ClientRegistryEntity, ClientRegistryRow>(
      ClientRegistryEntity,
      this.projection(),
      {
        filters: [Filter.fieldValue(field(ClientRegistryEntity, "is_enabled" as any), "=", true)],
      },
    );
    return rows as ClientRegistryRow[];
  }

  /**
   * Self-enroll a `source='registry'` row (the BE never sends
   * `service.register` — it owns the table directly). Mirrors the lifecycle
   * subscriber's upsert: registry rows are system-owned.
   */
  async upsertRegistryRow(uaPrefix: string, clientKeyHash: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO system.client_registry (ua_prefix, client_key_hash, source, is_enabled, created_by, updated_by)
       VALUES ($1, $2, 'registry', true, 'self-enroll', 'self-enroll')
       ON CONFLICT (ua_prefix) DO UPDATE
         SET client_key_hash = EXCLUDED.client_key_hash,
             updated_at = now(), updated_by = 'self-enroll',
             deleted_at = NULL, deleted_by = NULL
         WHERE system.client_registry.source = 'registry'`,
      [uaPrefix, clientKeyHash],
    );
  }
}
