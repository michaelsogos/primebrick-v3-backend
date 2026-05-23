import { z } from "zod";
import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "../auth/permissions.js";
import { validateBody } from "../../http/validation.js";
import { asyncHandler } from "../../http/async-handler.js";
import { getPool } from "../../db/pool.js";
import { AuditService } from "../../lib/audit/audit-service.js";
import { OrganizationsDal, type OrganizationListQuery } from "./organizations_dal.js";
import { CasdoorApiClient } from "./casdoor-api-client.js";
import { loadAuthConfigFromDb } from "./config-repo.js";

export function organizationsRouter() {
  const router = makeProtectedRouter();

  function getDal() {
    const pool = getPool();
    const auditService = new AuditService(pool);
    return new OrganizationsDal(pool, auditService);
  }

  let casdoorClient: CasdoorApiClient | null = null;

  const getCasdoorClient = async (): Promise<CasdoorApiClient | null> => {
    if (casdoorClient) return casdoorClient;
    try {
      const pool = getPool();
      const dbConfig = await loadAuthConfigFromDb(pool);
      if (!dbConfig.casdoorBuiltinClientId || !dbConfig.casdoorBuiltinClientSecret) {
        console.warn("[Organizations Router] Casdoor builtin credentials not configured; skipping Casdoor sync");
        return null;
      }
      casdoorClient = new CasdoorApiClient({
        endpoint: dbConfig.casdoorEndpoint || process.env.CASDOOR_ENDPOINT || "http://localhost:8000",
        orgName: dbConfig.casdoorOrganization || "acme",
        clientId: dbConfig.casdoorBuiltinClientId,
        clientSecret: dbConfig.casdoorBuiltinClientSecret,
      });
      return casdoorClient;
    } catch (error) {
      console.error("[Organizations Router] Failed to create Casdoor API client:", error);
      return null;
    }
  };

  // GET /api/v1/entities/organization/meta - List metadata
  router.get(
    "/api/v1/entities/organization/meta",
    rbacHandler([Permission.ORGANIZATIONS_READ_ALL, Permission.ORGANIZATIONS_READ_SINGLE]),
    asyncHandler(async (req, res) => {
      const meta = {
        entity: "organization",
        titleKey: "entities.organization.title",
        uid: "uuid",
        list: {
          columns: [
            { key: "uuid", labelKey: "entities.organization.fields.uuid", type: "text", sortable: true, defaultVisible: false, filterable: true },
            { key: "idp_code", labelKey: "entities.organization.fields.idp_code", type: "text", sortable: true, defaultVisible: true, sticky: true, filterable: true },
            { key: "display_name", labelKey: "entities.organization.fields.display_name", type: "text", sortable: true, defaultVisible: true, filterable: true },
            { key: "website_url", labelKey: "entities.organization.fields.website_url", type: "text", sortable: true, defaultVisible: true, filterable: true },
            { key: "user_count", labelKey: "entities.organization.fields.user_count", type: "number", sortable: false, defaultVisible: true },
            { key: "created_at", labelKey: "entities.organization.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
            { key: "updated_at", labelKey: "entities.organization.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
            { key: "created_by", labelKey: "entities.organization.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
            { key: "updated_by", labelKey: "entities.organization.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
            { key: "version", labelKey: "entities.organization.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
            { key: "deleted_at", labelKey: "entities.organization.fields.deleted_at", type: "datetime", sortable: true, defaultVisible: false, searchable: false },
            { key: "deleted_by", labelKey: "entities.organization.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
          ],
          stickyColumns: [
            { key: "uuid", labelKey: "entities.organization.fields.uuid", type: "text", sortable: true, defaultVisible: false, filterable: true },
            { key: "idp_code", labelKey: "entities.organization.fields.idp_code", type: "text", sortable: true, defaultVisible: true, sticky: true, filterable: true },
          ],
          auditingColumns: [
            { key: "created_at", labelKey: "entities.organization.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
            { key: "created_by", labelKey: "entities.organization.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
            { key: "updated_at", labelKey: "entities.organization.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
            { key: "updated_by", labelKey: "entities.organization.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
            { key: "version", labelKey: "entities.organization.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
            { key: "deleted_at", labelKey: "entities.organization.fields.deleted_at", type: "datetime", sortable: true, defaultVisible: false, searchable: false },
            { key: "deleted_by", labelKey: "entities.organization.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
          ],
          defaultSort: { key: "created_at", dir: "desc" },
          defaultPageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
          searchPlaceholderKey: "entities.list.searchPlaceholder",
          rowActions: {
            duplicate: true,
            delete: true,
            edit: true,
            preview: true
          },
          viewVisibility: {
            table: {
              notHideable: ["idp_code"],
              hidden: ["uuid", "created_by", "updated_by", "version", "deleted_at", "deleted_by"],
              notDisplayable: []
            },
            cards: {
              notHideable: ["idp_code"],
              hidden: ["uuid", "created_by", "updated_by", "version", "deleted_at", "deleted_by"],
              notDisplayable: []
            },
            cards_list: {
              notHideable: ["idp_code"],
              hidden: ["uuid", "created_by", "updated_by", "version", "deleted_at", "deleted_by"],
              notDisplayable: []
            }
          }
        },
      };
      res.json(meta);
    })
  );

  // GET /api/v1/entities/organization/list - List organizations
  router.get(
    "/api/v1/entities/organization/list",
    rbacHandler([Permission.ORGANIZATIONS_READ_ALL]),
    asyncHandler(async (req, res) => {
      const { search, search_in, sort_key, sort_dir, page, page_size, filters, connector, deleted_records } = req.query;

      const query: OrganizationListQuery = {
        search: search as string | undefined,
        search_in: search_in ? (search_in as string).split(",") : undefined,
        sort_key: sort_key as string | null,
        sort_dir: sort_dir as "asc" | "desc",
        page: page ? parseInt(page as string, 10) : 1,
        page_size: page_size ? parseInt(page_size as string, 10) : 25,
        filters: filters ? JSON.parse(filters as string) : undefined,
        connector: connector as "AND" | "OR",
        deleted_records: (deleted_records as "EXCLUDED" | "ONLY" | "INCLUDED") || "EXCLUDED",
      };

      const result = await getDal().listOrganizations(query);
      res.json(result);
    })
  );

  // GET /api/v1/entities/organization/:uuid - Get single organization
  router.get(
    "/api/v1/entities/organization/:uuid",
    rbacHandler([Permission.ORGANIZATIONS_READ_SINGLE]),
    asyncHandler(async (req, res) => {
      const { uuid } = req.params;
      const org = await getDal().getByUuid(uuid as string);

      if (!org) {
        res.status(404).json({
          type: "/errors/not-found",
          title: "Organization not found",
          status: 404,
          detail: "Organization not found in database",
          internal_code: "ORGANIZATION_NOT_FOUND",
          severity: "HIGH",
        });
        return;
      }

      res.json(org);
    })
  );

  // POST /api/v1/entities/organization - Create organization
  const CreateBodySchema = z.object({
    idp_code: z.string().min(1).max(255),
    display_name: z.string().max(255).optional(),
    website_url: z.string().url().max(2048).optional().or(z.literal("")),
  });

  router.post(
    "/api/v1/entities/organization",
    rbacHandler([Permission.ORGANIZATIONS_CREATE_SINGLE]),
    validateBody(CreateBodySchema),
    asyncHandler(async (req, res) => {
      const { idp_code, display_name, website_url } = req.body;

      // Sync to Casdoor first
      console.log("[Organization Create] Starting Casdoor sync for organization", idp_code);
      const cdClient = await getCasdoorClient();
      if (cdClient) {
        const syncSuccess = await cdClient.addOrganization({
          name: idp_code,
          displayName: display_name,
          websiteUrl: website_url || undefined,
        });

        if (!syncSuccess) {
          console.error("[Organization Create] Casdoor sync failed, aborting creation");
          res.status(502).json({
            type: "/errors/internal-error",
            title: "Casdoor sync failed",
            status: 502,
            detail: "Failed to create organization in Casdoor",
            instance: "/api/v1/entities/organization",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          });
          return;
        }

        console.log("[Organization Create] Casdoor sync successful, creating local DB record");
      } else {
        console.log("[Organization Create] Casdoor client not available, skipping sync");
      }

      // Create in local DB
      const result = await getDal().createOrganization({
        idp_code,
        display_name,
        website_url: website_url || undefined,
      });

      res.status(201).json({ success: true, uuid: result.uuid });
    })
  );

  // PUT /api/v1/entities/organization/:uuid - Update organization
  const UpdateBodySchema = z.object({
    display_name: z.string().max(255).optional(),
    website_url: z.string().url().max(2048).optional().or(z.literal("")),
  });

  router.put(
    "/api/v1/entities/organization/:uuid",
    rbacHandler([Permission.ORGANIZATIONS_UPDATE_SINGLE]),
    validateBody(UpdateBodySchema),
    asyncHandler(async (req, res) => {
      const { uuid } = req.params;
      const { display_name, website_url } = req.body;

      // Fetch current organization first
      const org = await getDal().getByUuid(uuid as string);
      if (!org) {
        res.status(404).json({
          type: "/errors/not-found",
          title: "Organization not found",
          status: 404,
          detail: "Organization not found in database",
          internal_code: "ORGANIZATION_NOT_FOUND",
          severity: "HIGH",
        });
        return;
      }

      // Sync to Casdoor first
      console.log("[Organization Update] Starting Casdoor sync for organization", org.idp_code);
      const cdClient = await getCasdoorClient();
      if (cdClient) {
        const syncSuccess = await cdClient.updateOrganization({
          name: org.idp_code,
          displayName: display_name || org.display_name,
          websiteUrl: website_url || org.website_url,
        });

        if (!syncSuccess) {
          console.error("[Organization Update] Casdoor sync failed, aborting update");
          res.status(502).json({
            type: "/errors/internal-error",
            title: "Casdoor sync failed",
            status: 502,
            detail: "Failed to sync organization to Casdoor",
            instance: "/api/v1/entities/organization",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          });
          return;
        }

        console.log("[Organization Update] Casdoor sync successful, updating local DB with last_synced_at");
      } else {
        console.log("[Organization Update] Casdoor client not available, skipping sync");
      }

      // Update local DB
      const updateBody: { display_name?: string; website_url?: string; last_synced_at?: Date } = {};
      if (display_name !== undefined) updateBody.display_name = display_name;
      if (website_url !== undefined) updateBody.website_url = website_url || undefined;
      updateBody.last_synced_at = new Date();

      await getDal().updateOrganization(uuid as string, updateBody);

      res.json({ success: true });
    })
  );

  // DELETE /api/v1/entities/organization/:uuid - Delete organization
  router.delete(
    "/api/v1/entities/organization/:uuid",
    rbacHandler([Permission.ORGANIZATIONS_DELETE_SINGLE]),
    asyncHandler(async (req, res) => {
      const { uuid } = req.params;

      // Fetch current organization first
      const org = await getDal().getByUuid(uuid as string);
      if (!org) {
        res.status(404).json({
          type: "/errors/not-found",
          title: "Organization not found",
          status: 404,
          detail: "Organization not found in database",
          internal_code: "ORGANIZATION_NOT_FOUND",
          severity: "HIGH",
        });
        return;
      }

      // Sync to Casdoor first
      console.log("[Organization Delete] Starting Casdoor sync for organization", org.idp_code);
      const cdClient = await getCasdoorClient();
      if (cdClient) {
        const syncSuccess = await cdClient.deleteOrganization(org.idp_code);

        if (!syncSuccess) {
          console.error("[Organization Delete] Casdoor sync failed, aborting deletion");
          res.status(502).json({
            type: "/errors/internal-error",
            title: "Casdoor sync failed",
            status: 502,
            detail: "Failed to delete organization from Casdoor",
            instance: "/api/v1/entities/organization",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          });
          return;
        }

        console.log("[Organization Delete] Casdoor sync successful, deleting from local DB");
      } else {
        console.log("[Organization Delete] Casdoor client not available, skipping sync");
      }

      // Delete from local DB
      await getDal().deleteOrganization(uuid as string);

      res.json({ success: true });
    })
  );

  // POST /api/v1/entities/organization/:uuid/restore - Restore organization
  router.post(
    "/api/v1/entities/organization/:uuid/restore",
    rbacHandler([Permission.ORGANIZATIONS_RESTORE_SINGLE]),
    asyncHandler(async (req, res) => {
      const { uuid } = req.params;

      // Fetch current organization first
      const org = await getDal().getByUuid(uuid as string);
      if (!org) {
        res.status(404).json({
          type: "/errors/not-found",
          title: "Organization not found",
          status: 404,
          detail: "Organization not found in database",
          internal_code: "ORGANIZATION_NOT_FOUND",
          severity: "HIGH",
        });
        return;
      }

      // Restore in Casdoor (re-create if deleted)
      console.log("[Organization Restore] Starting Casdoor sync for organization", org.idp_code);
      const cdClient = await getCasdoorClient();
      if (cdClient) {
        const syncSuccess = await cdClient.addOrganization({
          name: org.idp_code,
          displayName: org.display_name,
          websiteUrl: org.website_url,
        });

        if (!syncSuccess) {
          console.error("[Organization Restore] Casdoor sync failed, aborting restore");
          res.status(502).json({
            type: "/errors/internal-error",
            title: "Casdoor sync failed",
            status: 502,
            detail: "Failed to restore organization in Casdoor",
            instance: "/api/v1/entities/organization",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          });
          return;
        }

        console.log("[Organization Restore] Casdoor sync successful, restoring in local DB");
      } else {
        console.log("[Organization Restore] Casdoor client not available, skipping sync");
      }

      // Restore in local DB
      await getDal().restoreOrganization(uuid as string);

      res.json({ success: true });
    })
  );

  // GET /api/v1/entities/organization/:uuid/audit - Audit history
  router.get(
    "/api/v1/entities/organization/:uuid/audit",
    rbacHandler([Permission.ORGANIZATIONS_READ_AUDIT]),
    asyncHandler(async (req, res) => {
      const { uuid } = req.params;
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);

      const result = await getDal().getOrganizationAudit(uuid as string, page, limit);
      res.json(result);
    })
  );

  return router;
}
