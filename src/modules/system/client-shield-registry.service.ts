/**
 * ClientShieldRegistryService — domain service for `system.client_shield_registry`.
 *
 * The ONLY place client-registry rows are read/written. The table is the
 * source of truth for the internal caller allowlist: `source='registry'`
 * rows are auto-maintained by the service lifecycle subscriber (immutable
 * to admins); `source='manual'` rows are admin-managed.
 * Data access is `getDal()` proxies — no Repository construction.
 */

import { randomBytes, createHmac } from "node:crypto";

import { Project, field, Filter, type Repository } from "@primebrick/dal-pg";
import { clientKeyHash, deriveClientKey } from "@primebrick/sdk";

import {getDal} from "../../db/dal-gateway.js";
import { makeEntityService, type EntityService } from "../../http/entity-service.js";
import { deriveSearchableKeys } from "../../lib/search-keys.js";
import { UnprocessableEntityError } from "../../http/api-errors.js";
import { getConfigEntriesService } from "../auth/services/config-entries.service.js";
import { ClientShieldRegistryEntity } from "./client_shield_registry_entity.js";
import { clientRegistryMeta } from "./client-shield-registry.meta.js";
import type {
  ClientRegistryCreateEntity,
  ClientRegistryListQuery,
  ClientRegistryUpdateEntity,
} from "./client-shield-registry.dto.js";

export interface ClientShieldRegistryRow {
  ua_prefix: string;
  client_key_hash: string;
  source: string;
  is_enabled: boolean;
  uuid?: string;
  /** 'static' | 'derived' — see client_shield_registry_entity (B14). */
  key_mode?: string;
  /** BE-issued generation for derived rows — bumped by the rotate endpoint. */
  key_generation?: number;
  previous_key_hash?: string | null;
  /** Date on the DB row, ISO string on the wire. */
  previous_valid_until?: Date | string | null;
}

/** Post-rotation grace: the outgoing hash stays valid this long. */
const ROTATION_GRACE_MS = 5 * 60_000;

const PROJECTION = [
  Project.field(field(ClientShieldRegistryEntity, "uuid" as any)),
  Project.field(field(ClientShieldRegistryEntity, "ua_prefix" as any)),
  Project.field(field(ClientShieldRegistryEntity, "client_key_hash" as any)),
  Project.field(field(ClientShieldRegistryEntity, "source" as any)),
  Project.field(field(ClientShieldRegistryEntity, "is_enabled" as any)),
  Project.field(field(ClientShieldRegistryEntity, "key_mode" as any)),
  Project.field(field(ClientShieldRegistryEntity, "key_generation" as any)),
  Project.field(field(ClientShieldRegistryEntity, "previous_key_hash" as any)),
  Project.field(field(ClientShieldRegistryEntity, "previous_valid_until" as any)),
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
   *
   * Generation semantics (B14): a derived-mode row OWNS its generation —
   * a service claiming an older one is reported `stale_generation` (no
   * write) so the registrar can self-heal with the hinted generation; a
   * claim ≥ current rotates the hash in (previous hash kept through the
   * grace window) and upgrades the row to `derived` when needed.
   */
  async enrollRegistryRow(
    uaPrefix: string,
    clientKeyHash: string,
    actor = "self-enroll",
    opts: { keyMode?: "static" | "derived"; keyGeneration?: number } = {},
  ): Promise<{ outcome: "enrolled" | "stale_generation"; key_generation?: number }> {
    const dal = getDal();
    const claimedGen = opts.keyGeneration ?? 0;
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
              key_mode: opts.keyMode ?? "static",
              key_generation: claimedGen,
            },
            { actor },
          );
          return { outcome: "enrolled" };
        } catch (err) {
          const code = (err as { code?: string }).code;
          if ((code === "ERR04" || code === "ERR05") && attempt === 0) continue;
          throw err;
        }
      }

      if (existing.source !== "registry") return { outcome: "enrolled" }; // admin-owned manual row

      // Stale-generation rejection: the service derives for an older
      // generation than issued — no write; the caller gets the current
      // generation back and retries with the right derived key.
      if (
        existing.key_mode === "derived" &&
        opts.keyMode === "derived" &&
        claimedGen < (existing.key_generation ?? 0)
      ) {
        return { outcome: "stale_generation", key_generation: existing.key_generation ?? 0 };
      }

      let version = existing.version;
      if (existing.deleted_at) {
        const restored = await dal.restore<ClientShieldRegistryEntity, { version: number }>(
          ClientShieldRegistryEntity,
          { uuid: existing.uuid, version } as never,
          { actor, matchBy: "uuid" as never },
        );
        version = restored.version;
      }
      const hashChanged = existing.client_key_hash !== clientKeyHash;
      const now = new Date();
      await dal.update(
        ClientShieldRegistryEntity,
        {
          uuid: existing.uuid,
          client_key_hash: clientKeyHash,
          is_enabled: true,
          // Migration path: a service registering with derived material
          // upgrades its row; explicit generation claims advance it forward.
          key_mode: opts.keyMode ?? existing.key_mode,
          key_generation: opts.keyMode === "derived" ? Math.max(claimedGen, existing.key_generation ?? 0) : existing.key_generation,
          // Grace window: the outgoing hash keeps answering while callers
          // converge on the new key.
          ...(hashChanged
            ? {
                previous_key_hash: existing.client_key_hash,
                previous_valid_until: new Date(now.getTime() + ROTATION_GRACE_MS),
                key_rotated_at: now,
              }
            : {}),
          version,
        } as never,
        { actor, matchBy: "uuid" as never },
      );
      return { outcome: "enrolled" };
    }
    return { outcome: "enrolled" };
  }

  // --- Admin CRUD (source='manual' rows) ------------------------------------
  //
  // Registry rows (`source='registry'`) are auto-maintained by the service
  // lifecycle — admin writes on them are rejected to keep the ownership
  // boundary sharp. The generic entity service owns list/get/audit plumbing;
  // writes go through it too after the manual-only guard.

  private _svc: EntityService<Record<string, unknown>> | undefined;

  private svc(): EntityService<Record<string, unknown>> {
    this._svc ??= makeEntityService<Record<string, unknown>>({
      entity: ClientShieldRegistryEntity,
      debugCode: "CLIENT_REGISTRY",
      list: {
        searchableKeys: deriveSearchableKeys(clientRegistryMeta, ClientShieldRegistryEntity),
        filterableKeys: new Set(["ua_prefix", "source", "key_mode", "is_enabled", "created_at", "updated_at", "key_rotated_at"]),
        defaultSort: { key: "created_at", dir: "desc" },
        extraFilters: (q) =>
          (q as ClientRegistryListQuery).source
            ? [Filter.fieldValue(field(ClientShieldRegistryEntity, "source" as never), "=", (q as ClientRegistryListQuery).source)]
            : [],
      },
    });
    return this._svc;
  }

  /** Read one row and reject when it is not admin-owned. */
  private async assertManual(uuid: string): Promise<ClientShieldRegistryRow> {
    const row = (await this.svc().get(uuid)) as unknown as ClientShieldRegistryRow;
    if (row.source !== "manual") {
      throw new UnprocessableEntityError(
        "Registry-managed client rows are auto-maintained by the service lifecycle and cannot be edited",
        { internal_code: "CLIENT_REGISTRY_ROW_NOT_EDITABLE" },
      );
    }
    return row;
  }

  async listClients(query: ClientRegistryListQuery) {
    return this.svc().list(query);
  }

  async getClient(uuid: string) {
    return this.svc().get(uuid);
  }

  /**
   * Create a `source='manual'` row. `client_key` is hashed before persisting;
   * when absent the server generates a strong key and echoes it ONCE in the
   * returned `client_key` field (never stored, never returned again).
   */
  async createClient(body: ClientRegistryCreateEntity, tx?: Repository) {
    const rawKey = body.client_key ?? randomBytes(32).toString("base64url");
    const row = await this.svc().create(
      {
        ua_prefix: body.ua_prefix,
        client_key_hash: clientKeyHash(rawKey),
        source: "manual",
        is_enabled: body.is_enabled ?? true,
      },
      tx,
    );
    return body.client_key === undefined
      ? { ...row, client_key: rawKey }
      : row;
  }

  async updateClient(uuid: string, body: ClientRegistryUpdateEntity, tx?: Repository) {
    await this.assertManual(uuid);
    const { client_key, ...rest } = body;
    const patch: Record<string, unknown> = { ...rest };
    if (client_key !== undefined) patch.client_key_hash = clientKeyHash(client_key);
    return this.svc().update(uuid, patch as Record<string, unknown> & { version: number }, tx);
  }

  async deleteClient(uuid: string, version: number) {
    await this.assertManual(uuid);
    return this.svc().delete(uuid, version);
  }

  async restoreClient(uuid: string, version: number) {
    return this.svc().restore(uuid, version);
  }

  async getClientAudit(uuid: string, page: number, limit: number) {
    return this.svc().audit(uuid, page, limit);
  }

  // --- Key rotation (B14) ---------------------------------------------------
  //
  // `service_key_derivation_master` (config_entries, BE-side) is the root of
  // the two-level HMAC chain: service secret = HMAC(master, ua_prefix);
  // generation key  = HMAC(service_secret, `${ua_prefix}:${generation}`).
  // Holding the master lets the BE verify ANY claimed derived key and mint
  // per-service secrets for the installer — while no secret ever crosses
  // the bus (services see only their own, consumers only hashes).

  /** Per-service derivation secret for `ua_prefix`; null when no master is configured. */
  private async serviceSecret(uaPrefix: string): Promise<string | null> {
    const master = (await getConfigEntriesService().findByKey("service_key_derivation_master"))?.value;
    return master ? createHmac("sha256", master).update(uaPrefix).digest("base64url") : null;
  }

  /**
   * Verify a derived-mode claim (service.register bootstrap lane): the
   * caller's `client_key_hash` must equal the hash of
   * `derive(service_secret, prefix, claimedGeneration)` — proof it holds the
   * derivation secret, regardless of which generation it derived for.
   */
  async verifyDerivedClaim(uaPrefix: string, claimedGeneration: number, claimedHash: string): Promise<boolean> {
    const secret = await this.serviceSecret(uaPrefix);
    if (!secret) return false;
    return clientKeyHash(deriveClientKey(secret, uaPrefix, claimedGeneration)) === claimedHash;
  }

  /**
   * Mint the per-service derivation secret for `ua_prefix` — returned ONCE
   * so the admin can place it in the service's module config
   * (`service_key_derivation_secret`). Requires the BE master secret.
   */
  async deriveServiceSecret(uuid: string) {
    const row = (await this.svc().get(uuid)) as unknown as ClientShieldRegistryRow;
    const secret = await this.serviceSecret(row.ua_prefix);
    if (!secret) {
      throw new UnprocessableEntityError(
        "config_entries 'service_key_derivation_master' is not set — derived-key mode is unavailable",
        { internal_code: "CLIENT_REGISTRY_DERIVATION_MASTER_MISSING" },
      );
    }
    return { ua_prefix: row.ua_prefix, service_key_derivation_secret: secret };
  }

  /**
   * Rotate a row's key (admin endpoint POST /clients/:uuid/rotate):
   *   - manual row: swaps the hash to `client_key` (or a generated one,
   *     echoed ONCE) — previous hash stays valid through the grace window;
   *   - derived registry row: bumps `key_generation` and pre-computes the
   *     new derived hash itself (zero-gap — the service's next key is
   *     valid the instant it re-derives);
   *   - static registry row: requires an explicit `client_key` — the
   *     service's own config must be updated to match within the grace
   *     window.
   */
  async rotateClientKey(uuid: string, body: { client_key?: string }, tx?: Repository) {
    const row = (await this.svc().get(uuid)) as unknown as ClientShieldRegistryRow & { version: number };
    const now = new Date();

    if (row.key_mode === "derived" && body.client_key === undefined) {
      const secret = await this.serviceSecret(row.ua_prefix);
      if (!secret) {
        throw new UnprocessableEntityError(
          "config_entries 'service_key_derivation_master' is not set — derived-key mode is unavailable",
          { internal_code: "CLIENT_REGISTRY_DERIVATION_MASTER_MISSING" },
        );
      }
      const generation = (row.key_generation ?? 0) + 1;
      const nextHash = clientKeyHash(deriveClientKey(secret, row.ua_prefix, generation));
      const updated = await this.svc().update(
        uuid,
        {
          client_key_hash: nextHash,
          previous_key_hash: row.client_key_hash,
          previous_valid_until: new Date(now.getTime() + ROTATION_GRACE_MS),
          key_generation: generation,
          key_rotated_at: now,
          version: row.version,
        } as Record<string, unknown> & { version: number },
        tx,
      );
      return { ...updated, key_generation: generation };
    }

    if (row.source === "registry" && body.client_key === undefined) {
      throw new UnprocessableEntityError(
        "Static registry rows require an explicit client_key — update the service's module config to match within the grace window",
        { internal_code: "CLIENT_REGISTRY_ROTATE_KEY_REQUIRED" },
      );
    }

    const rawKey = body.client_key ?? randomBytes(32).toString("base64url");
    const updated = await this.svc().update(
      uuid,
      {
        client_key_hash: clientKeyHash(rawKey),
        previous_key_hash: row.client_key_hash,
        previous_valid_until: new Date(now.getTime() + ROTATION_GRACE_MS),
        key_rotated_at: now,
        version: row.version,
      } as Record<string, unknown> & { version: number },
      tx,
    );
    return body.client_key === undefined
      ? { ...updated, client_key: rawKey }
      : updated;
  }
}
