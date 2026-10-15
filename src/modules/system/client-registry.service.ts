/**
 * ClientRegistryService — domain service for `system.client_registry`.
 *
 * The ONLY place client-registry rows are read/written. The table is the
 * source of truth for the internal caller allowlist: `source='registry'`
 * rows are auto-maintained by the service lifecycle subscriber (immutable
 * to admins); `source='manual'` rows are admin-managed.
 * Data access is `initDal()` proxies — no Repository construction.
 */

import { Project, field, Filter } from "@primebrick/dal-pg";

import { initDal } from "../../db/dal-gateway.js";
import { ClientRegistryEntity } from "./client_registry_entity.js";

export interface ClientRegistryRow {
  ua_prefix: string;
  client_key_hash: string;
  source: string;
  is_enabled: boolean;
  uuid?: string;
}

const PROJECTION = [
  Project.field(field(ClientRegistryEntity, "uuid" as any)),
  Project.field(field(ClientRegistryEntity, "ua_prefix" as any)),
  Project.field(field(ClientRegistryEntity, "client_key_hash" as any)),
  Project.field(field(ClientRegistryEntity, "source" as any)),
  Project.field(field(ClientRegistryEntity, "is_enabled" as any)),
];

export class ClientRegistryService {
  /** All enabled, non-deleted rows — the snapshot served to microservices. */
  async findAllEnabled(): Promise<ClientRegistryRow[]> {
    const rows = await initDal().findAll<ClientRegistryEntity, ClientRegistryRow>(
      ClientRegistryEntity,
      PROJECTION,
      {
        filters: [Filter.fieldValue(field(ClientRegistryEntity, "is_enabled" as any), "=", true)],
      },
    );
    return rows as ClientRegistryRow[];
  }

  /**
   * Enroll/refresh a `source='registry'` row — used by the BE self-enroll
   * (`backend-identity`) and the lifecycle subscriber for service
   * re-registrations. Find → add | restore+update — no `ON CONFLICT`
   * upsert: the version guard travels through `update()`, so concurrent
   * enrolls surface ERR01 instead of silently overwriting.
   * Admin-created `source='manual'` rows are never touched.
   */
  async enrollRegistryRow(uaPrefix: string, clientKeyHash: string, actor = "self-enroll"): Promise<void> {
    const dal = initDal();
    // One retry covers the concurrent-enroll race: two instances may both
    // find no row and race on `add` — the loser hits ERR04/ERR05 and retries
    // as a normal versioned update.
    for (let attempt = 0; attempt < 2; attempt++) {
      const existing = await dal.find<
        ClientRegistryEntity,
        ClientRegistryRow & { version: number; deleted_at?: Date | null }
      >(
        ClientRegistryEntity,
        [
          ...PROJECTION,
          Project.field(field(ClientRegistryEntity, "version" as any)),
          Project.field(field(ClientRegistryEntity, "deleted_at" as any)),
        ],
        {
          filters: [Filter.fieldValue(field(ClientRegistryEntity, "ua_prefix" as any), "=", uaPrefix)],
          deletedRecords: "INCLUDED",
          throwIfNotFound: false,
        },
      );

      if (!existing) {
        try {
          await dal.add(
            ClientRegistryEntity,
            {
              ua_prefix: uaPrefix,
              client_key_hash: clientKeyHash,
              source: "registry",
              is_enabled: true,
            },
            { actor },
          );
          return;
        } catch (err) {
          const code = (err as { code?: string }).code;
          if ((code === "ERR04" || code === "ERR05") && attempt === 0) continue;
          throw err;
        }
      }

      if (existing.source !== "registry") return; // admin-owned manual row

      let version = existing.version;
      if (existing.deleted_at) {
        const restored = await dal.restore<ClientRegistryEntity, { version: number }>(
          ClientRegistryEntity,
          { uuid: existing.uuid, version } as never,
          { actor, matchBy: "uuid" as never },
        );
        version = restored.version;
      }
      await dal.update(
        ClientRegistryEntity,
        {
          uuid: existing.uuid,
          client_key_hash: clientKeyHash,
          is_enabled: true,
          version,
        } as never,
        { actor, matchBy: "uuid" as never },
      );
      return;
    }
  }
}
