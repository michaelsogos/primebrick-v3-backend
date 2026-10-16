/**
 * ClientShieldRegistryService — domain service for `system.client_shield_registry`.
 *
 * The ONLY place client-registry rows are read/written. The table is the
 * source of truth for the internal caller allowlist: `source='registry'`
 * rows are auto-maintained by the service lifecycle subscriber (immutable
 * to admins); `source='manual'` rows are admin-managed.
 * Data access is `getDal()` proxies — no Repository construction.
 */

import { Project, field, Filter } from "@primebrick/dal-pg";

import {getDal} from "../../db/dal-gateway.js";
import { ClientShieldRegistryEntity } from "./client_shield_registry_entity.js";

export interface ClientShieldRegistryRow {
  ua_prefix: string;
  client_key_hash: string;
  source: string;
  is_enabled: boolean;
  uuid?: string;
}

const PROJECTION = [
  Project.field(field(ClientShieldRegistryEntity, "uuid" as any)),
  Project.field(field(ClientShieldRegistryEntity, "ua_prefix" as any)),
  Project.field(field(ClientShieldRegistryEntity, "client_key_hash" as any)),
  Project.field(field(ClientShieldRegistryEntity, "source" as any)),
  Project.field(field(ClientShieldRegistryEntity, "is_enabled" as any)),
];

export class ClientShieldRegistryService {
  /** All enabled, non-deleted rows — the snapshot served to microservices. */
  async findAllEnabled(): Promise<ClientShieldRegistryRow[]> {
    const rows = await getDal().findAll<ClientShieldRegistryEntity, ClientShieldRegistryRow>(
      ClientShieldRegistryEntity,
      PROJECTION,
      {
        filters: [Filter.fieldValue(field(ClientShieldRegistryEntity, "is_enabled" as any), "=", true)],
      },
    );
    return rows as ClientShieldRegistryRow[];
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
    const dal = getDal();
    // One retry covers the concurrent-enroll race: two instances may both
    // find no row and race on `add` — the loser hits ERR04/ERR05 and retries
    // as a normal versioned update.
    for (let attempt = 0; attempt < 2; attempt++) {
      const existing = await dal.find<
        ClientShieldRegistryEntity,
        ClientShieldRegistryRow & { version: number; deleted_at?: Date | null }
      >(
        ClientShieldRegistryEntity,
        [
          ...PROJECTION,
          Project.field(field(ClientShieldRegistryEntity, "version" as any)),
          Project.field(field(ClientShieldRegistryEntity, "deleted_at" as any)),
        ],
        {
          filters: [Filter.fieldValue(field(ClientShieldRegistryEntity, "ua_prefix" as any), "=", uaPrefix)],
          deletedRecords: "INCLUDED",
          throwIfNotFound: false,
        },
      );

      if (!existing) {
        try {
          await dal.add(
            ClientShieldRegistryEntity,
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
        const restored = await dal.restore<ClientShieldRegistryEntity, { version: number }>(
          ClientShieldRegistryEntity,
          { uuid: existing.uuid, version } as never,
          { actor, matchBy: "uuid" as never },
        );
        version = restored.version;
      }
      await dal.update(
        ClientShieldRegistryEntity,
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
