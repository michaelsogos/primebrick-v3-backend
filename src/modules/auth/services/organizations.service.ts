/**
 * OrganizationsService — Casdoor-orchestrated CRUD for `organization`.
 *
 * DB access is delegated to `makeEntityService` (Part E) — the generic owns
 * list/get/write/audit plumbing, including `user_count` via a LEFT JOIN +
 * GROUP BY aggregate (E.3a: ONE query, no N+1). This facade keeps what is
 * genuinely domain-specific:
 *   - Casdoor sync before every local write (fail = no local write);
 *   - `checkAvailability` (idp_code lookup used by the FE create form);
 *   - audit delta enrichment (display_name alongside changed_by GUIDs).
 *
 * Bulk ops / purge / duplicate / export do NOT exist for this entity by
 * design: the Casdoor sync contract is per-organization and cannot be
 * batched (see organizations.router.ts header).
 */

import type { PoolClient } from "pg";

import { makeEntityService, type EntityService } from "../../../http/entity-service.js";
import { OrganizationEntity } from "../organization_entity.js";
import { UserProfileEntity } from "../user_profile_entity.js";
import { organizationMeta } from "../organizations.meta.js";
import type { OrganizationDetailDto, OrganizationDetailRow } from "../dto.js";
import type { OrganizationListQueryInput } from "../dto.js";
import { CasdoorService } from "./casdoor.service.js";
import { getAuthConfig } from "../config.js";
import { getPool } from "../../../db/pool.js";
import { deriveSearchableKeys } from "../../../lib/search-keys.js";
import {
  ApiError,
  NotFoundError,
} from "../../../http/api-errors.js";

const ORG_FILTERABLE_FIELDS = new Set(["display_name", "idp_code", "website_url"]);

export interface CreateOrganizationInput {
  idp_owner: string;
  idp_name: string;
  display_name?: string;
  website_url?: string;
}

export interface UpdateOrganizationInput {
  display_name?: string;
  website_url?: string;
  /** Caller-observed row version — optimistic-concurrency token (ERR02 if absent). */
  version?: number;
}

export class OrganizationsService {
  private svc: EntityService<OrganizationDetailDto>;
  private casdoor: CasdoorService | null = null;

  constructor() {
    this.svc = makeEntityService<OrganizationDetailDto>({
      entity: OrganizationEntity,
      list: {
        searchableKeys: deriveSearchableKeys(organizationMeta, OrganizationEntity),
        filterableKeys: ORG_FILTERABLE_FIELDS,
        defaultSort: { key: "created_at", dir: "asc" },
        aggregates: [{
          name: "user_count",
          expr: "COUNT(u.id)",
          cast: "int",
          join: {
            entity: UserProfileEntity,
            alias: "u",
            base: "idp_code",
            joined: "idp_org",
            extra: "u.deleted_at IS NULL AND u.is_active = true",
          },
        }],
      },
    });
  }

  private getCasdoor(): CasdoorService {
    if (this.casdoor) return this.casdoor;
    this.casdoor = new CasdoorService(getPool());
    return this.casdoor;
  }

  // --- List -----------------------------------------------------------------

  async listOrganizations(query: OrganizationListQueryInput) {
    return this.svc.list({ ...query, sort_key: query.sort_key ?? undefined });
  }

  // --- Single record --------------------------------------------------------

  async getOrganization(uuid: string): Promise<OrganizationDetailDto> {
    try {
      return await this.svc.get(uuid);
    } catch {
      throw new NotFoundError("Organization not found in database", {
        internal_code: "ORGANIZATION_NOT_FOUND",
      });
    }
  }

  private async getByIdpCode(idpCode: string): Promise<OrganizationDetailDto | null> {
    const result = await this.svc.list({
      filters: [{ field: "idp_code", op: "=", value: idpCode }],
      page_size: 1,
    });
    return result.rows[0] ?? null;
  }

  // --- Availability check ---------------------------------------------------

  async checkAvailability(
    idpOwner: string,
    idpName: string,
  ): Promise<{ available: boolean; idpCode: string; existingUuid?: string }> {
    const idpCode = `${idpOwner}/${idpName}`;
    const existing = await this.getByIdpCode(idpCode);
    if (existing) {
      return { available: false, idpCode, existingUuid: existing.uuid };
    }
    return { available: true, idpCode };
  }

  // --- Create ---------------------------------------------------------------

  async createOrganization(input: CreateOrganizationInput, tx?: PoolClient): Promise<OrganizationDetailDto> {
    const { idp_owner, idp_name, display_name, website_url } = input;
    const idpCode = `${idp_owner}/${idp_name}`;

    // Check for duplicate idp_code locally.
    const existingLocal = await this.getByIdpCode(idpCode);
    if (existingLocal) {
      throw new ApiError(
        "/errors/conflict",
        "Organization already exists",
        409,
        `An organization with idp_code "${idpCode}" already exists`,
        {
          instance: "/api/v1/entities/organization",
          internal_code: "ORGANIZATION_ALREADY_EXISTS",
          severity: "MEDIUM",
        },
      );
    }

    // Sync to Casdoor first (create-or-update).
    const cdClient = await this.getCasdoor().getClient();
    if (cdClient) {
      const existing = await cdClient.getOrganization(idpCode);
      let syncSuccess: boolean;
      if (existing) {
        syncSuccess = await cdClient.updateOrganization({
          name: idp_name,
          owner: idp_owner,
          displayName: display_name,
          websiteUrl: website_url || undefined,
          passwordType: "plain",
        } as any);
      } else {
        const created = await cdClient.addOrganization({
          name: idp_name,
          owner: idp_owner,
          displayName: display_name,
          websiteUrl: website_url || undefined,
          passwordType: "plain",
        } as any);
        syncSuccess = created !== null;
      }

      if (!syncSuccess) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor sync failed",
          502,
          "Failed to create/update organization in Casdoor",
          {
            instance: "/api/v1/entities/organization",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          },
        );
      }

      // Auto-enable WebAuthn on the Casdoor application based on auth_config.enable_webauthn.
      // This ensures that when a new org is created, the Casdoor app's WebAuthn flag
      // matches the Primebrick auth configuration. Best-effort: if this fails, the org
      // is still created — the admin can manually enable WebAuthn in Casdoor.
      try {
        const cfg = await getAuthConfig();
        if (cfg.enable_webauthn) {
          const casdoorApp = "primebrick-api";
          const casdoorAppOwner = "admin";
          await cdClient.setApplicationWebAuthn(casdoorApp, casdoorAppOwner, true);
        }
      } catch (webauthnErr) {
        console.error("Failed to auto-enable WebAuthn on Casdoor app:", webauthnErr);
      }
    }

    // Create in local DB, then re-read with audit joins (display names).
    const created = await this.svc.create(
      { idp_code: idpCode, idp_owner, idp_name, display_name, website_url: website_url || undefined },
      tx,
    );
    return this.getOrganization(created.uuid);
  }

  // --- Update ---------------------------------------------------------------

  async updateOrganization(uuid: string, input: UpdateOrganizationInput, tx?: PoolClient) {
    const { display_name, website_url } = input;
    const org = await this.getOrganization(uuid);

    // Sync to Casdoor first (non-best-effort: fail if sync fails).
    const cdClient = await this.getCasdoor().getClient();
    if (cdClient) {
      const syncSuccess = await cdClient.updateOrganization({
        name: org.idp_code,
        displayName: display_name || org.display_name,
        websiteUrl: website_url || org.website_url,
        passwordType: "plain",
      } as any);

      if (!syncSuccess) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor sync failed",
          502,
          "Failed to sync organization to Casdoor",
          {
            instance: "/api/v1/entities/organization",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          },
        );
      }

      // Propagate WebAuthn flag to the Casdoor application (best-effort).
      try {
        const cfg = await getAuthConfig();
        const casdoorApp = "primebrick-api";
        const casdoorAppOwner = "admin";
        await cdClient.setApplicationWebAuthn(casdoorApp, casdoorAppOwner, cfg.enable_webauthn);
      } catch (webauthnErr) {
        console.error("Failed to sync WebAuthn flag on update:", webauthnErr);
      }
    }

    // `version` is the caller-observed version — NOT org.version (the row we
    // just read is the observation for display-name fallbacks, not a
    // substitute for the caller's concurrency token).
    const updateBody: Record<string, unknown> = {
      version: input.version,
      last_synced_at: new Date(),
    };
    if (display_name !== undefined) updateBody.display_name = display_name;
    if (website_url !== undefined) updateBody.website_url = website_url || undefined;

    return await this.svc.update(uuid, updateBody as Record<string, unknown> & { version: number }, tx);
  }

  // --- Delete ---------------------------------------------------------------

  async deleteOrganization(uuid: string, version: number) {
    const org = await this.getOrganization(uuid);

    // Sync to Casdoor first (non-best-effort: fail if sync fails).
    const cdClient = await this.getCasdoor().getClient();
    if (cdClient) {
      const syncSuccess = await cdClient.deleteOrganization(org.idp_code);
      if (!syncSuccess) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor sync failed",
          502,
          "Failed to delete organization from Casdoor",
          {
            instance: "/api/v1/entities/organization",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          },
        );
      }
    }

    return await this.svc.delete(uuid, version);
  }

  // --- Restore --------------------------------------------------------------

  async restoreOrganization(uuid: string, version: number) {
    const org = await this.getOrganization(uuid);

    // Re-create in Casdoor (non-best-effort: fail if sync fails).
    const cdClient = await this.getCasdoor().getClient();
    if (cdClient) {
      const syncSuccess = await cdClient.addOrganization({
        name: org.idp_code,
        displayName: org.display_name,
        websiteUrl: org.website_url,
      } as any);
      if (!syncSuccess) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor sync failed",
          502,
          "Failed to restore organization in Casdoor",
          {
            instance: "/api/v1/entities/organization",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          },
        );
      }
    }

    return await this.svc.restore(uuid, version);
  }

  // --- Audit ----------------------------------------------------------------

  private isUuid(value: unknown): boolean {
    return typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value);
  }

  private enrichAuditDeltaWithDisplayNames(
    delta: Record<string, any>,
    changedByName: string | null,
  ): Record<string, any> {
    const enriched = { ...delta };
    for (const f of ["created_by", "updated_by", "deleted_by"]) {
      if (f in enriched) {
        const change = enriched[f];
        if (changedByName && this.isUuid(change.new)) change.new_display_name = changedByName;
        if (changedByName && this.isUuid(change.old)) change.old_display_name = changedByName;
      }
    }
    return enriched;
  }

  async getOrganizationAudit(uuid: string, page: number, limit: number) {
    const result = (await this.svc.audit(uuid, page, limit)) as {
      data: Array<Record<string, any>>;
      pagination: unknown;
    };
    return {
      data: result.data.map((row) => ({
        id: row.id.toString(),
        entity_uuid: row.entity_uuid,
        action: row.action,
        changed_at: row.changed_at,
        changed_by: row.changed_by,
        changed_by_name: row.changed_by_name, // canonical field emitted by svc.audit
        version: row.version,
        delta: this.enrichAuditDeltaWithDisplayNames(row.delta as Record<string, any>, row.changed_by_name),
      })),
      pagination: result.pagination,
    };
  }
}

// Re-exported so existing import sites keep working.
export type { OrganizationDetailDto, OrganizationDetailRow };
export type OrganizationListQuery = OrganizationListQueryInput;
export type OrganizationListResponse = {
  rows: OrganizationDetailDto[];
  page: number;
  page_size: number;
  total: bigint;
};
