/**
 * OrganizationsService — business logic for the `organization` entity.
 *
 * Owns the list / get / create / update / delete / restore / audit / check-
 * availability flows, coordinating the local `organizations` table with
 * Casdoor. The service is request-context-free: it takes plain parameters and
 * reads the actor from ALS (`requireActor()`) via the DAL. It never touches
 * `req`/`res`.
 *
 * Errors are thrown as `ApiError` subclasses so the centralized `errorHandler`
 * can convert them to RFC 7807 JSON.
 */

import { getPool } from "../../../db/pool.js";
import { AuditService } from "../../../lib/audit/audit-service.js";
import { OrganizationsDal, type OrganizationListQuery } from "../organizations_dal.js";
import { CasdoorService } from "./casdoor.service.js";
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from "../../../http/api-errors.js";
import type { OrganizationDetailDto } from "../organizations_dal.js";

export interface CreateOrganizationInput {
  idp_owner: string;
  idp_name: string;
  display_name?: string;
  website_url?: string;
}

export interface UpdateOrganizationInput {
  display_name?: string;
  website_url?: string;
}

export class OrganizationsService {
  private dal: OrganizationsDal | null = null;
  private casdoor: CasdoorService | null = null;

  private getDal(): OrganizationsDal {
    if (this.dal) return this.dal;
    const pool = getPool();
    const auditService = new AuditService(pool);
    this.dal = new OrganizationsDal(pool, auditService);
    return this.dal;
  }

  private getCasdoor(): CasdoorService {
    if (this.casdoor) return this.casdoor;
    this.casdoor = new CasdoorService(getPool());
    return this.casdoor;
  }

  // --- List -----------------------------------------------------------------

  async listOrganizations(query: OrganizationListQuery) {
    return this.getDal().listOrganizations(query);
  }

  // --- Single record --------------------------------------------------------

  async getOrganization(uuid: string): Promise<OrganizationDetailDto> {
    const org = await this.getDal().getByUuid(uuid);
    if (!org) {
      throw new NotFoundError("Organization not found in database", {
        internal_code: "ORGANIZATION_NOT_FOUND",
      });
    }
    return org;
  }

  // --- Availability check ---------------------------------------------------

  async checkAvailability(
    idpOwner: string,
    idpName: string,
  ): Promise<{ available: boolean; idpCode: string; existingUuid?: string }> {
    const idpCode = `${idpOwner}/${idpName}`;
    const existing = await this.getDal().getByIdpCode(idpCode);
    if (existing) {
      return { available: false, idpCode, existingUuid: existing.uuid };
    }
    return { available: true, idpCode };
  }

  // --- Create ---------------------------------------------------------------

  async createOrganization(input: CreateOrganizationInput): Promise<OrganizationDetailDto> {
    const { idp_owner, idp_name, display_name, website_url } = input;
    const idpCode = `${idp_owner}/${idp_name}`;

    // Check for duplicate idp_code locally.
    const existingLocal = await this.getDal().getByIdpCode(idpCode);
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
    }

    // Create in local DB.
    const result = await this.getDal().createOrganization({
      idp_code: idpCode,
      idp_owner,
      idp_name,
      display_name,
      website_url: website_url || undefined,
    });

    const createdOrg = await this.getDal().getByUuid(result.uuid);
    if (!createdOrg) {
      throw new NotFoundError("Organization not found after create", {
        internal_code: "ORGANIZATION_NOT_FOUND",
      });
    }
    return createdOrg;
  }

  // --- Update ---------------------------------------------------------------

  async updateOrganization(uuid: string, input: UpdateOrganizationInput): Promise<void> {
    const { display_name, website_url } = input;
    const org = await this.getDal().getByUuid(uuid);
    if (!org) {
      throw new NotFoundError("Organization not found in database", {
        internal_code: "ORGANIZATION_NOT_FOUND",
      });
    }

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
    }

    // Update local DB with last_synced_at.
    const updateBody: { display_name?: string; website_url?: string; last_synced_at?: Date } = {};
    if (display_name !== undefined) updateBody.display_name = display_name;
    if (website_url !== undefined) updateBody.website_url = website_url || undefined;
    updateBody.last_synced_at = new Date();

    await this.getDal().updateOrganization(uuid, updateBody as any);
  }

  // --- Delete ---------------------------------------------------------------

  async deleteOrganization(uuid: string): Promise<void> {
    const org = await this.getDal().getByUuid(uuid);
    if (!org) {
      throw new NotFoundError("Organization not found in database", {
        internal_code: "ORGANIZATION_NOT_FOUND",
      });
    }

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

    await this.getDal().deleteOrganization(uuid);
  }

  // --- Restore --------------------------------------------------------------

  async restoreOrganization(uuid: string): Promise<void> {
    const org = await this.getDal().getByUuid(uuid);
    if (!org) {
      throw new NotFoundError("Organization not found in database", {
        internal_code: "ORGANIZATION_NOT_FOUND",
      });
    }

    // Re-create in Casdoor (best-effort: fail if sync fails, matching original).
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

    await this.getDal().restoreOrganization(uuid);
  }

  // --- Audit ----------------------------------------------------------------

  async getOrganizationAudit(uuid: string, page: number, limit: number) {
    return this.getDal().getOrganizationAudit(uuid, page, limit);
  }
}
