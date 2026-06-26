import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "../auth/permissions.js";
import { asyncHandler } from "../../http/async-handler.js";
import { getPool } from "../../db/pool.js";
import { OrganizationsDal } from "../auth/organizations_dal.js";

export function systemRouter() {
  const router = makeProtectedRouter();

  // GET /api/v1/system/organizations/active - Active organizations for sidebar switcher
  router.get(
    "/api/v1/system/organizations/active",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      const dal = new OrganizationsDal(getPool());
      const result = await dal.listOrganizations({
        page: 1,
        page_size: 100,
        deleted_records: "EXCLUDED",
      });
      // Map to minimal DTO for the sidebar
      const orgs = result.rows.map((org) => ({
        uuid: org.uuid,
        idp_code: org.idp_code,
        idp_name: org.idp_name,
        display_name: org.display_name,
        avatar: org.avatar ?? null,
      }));
      res.json({ organizations: orgs });
    })
  );

  // GET /api/v1/system/roles/active - Available roles for form dropdowns
  router.get(
    "/api/v1/system/roles/active",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      const pool = getPool();
      const result = await pool.query(
        `SELECT idp_role, label_key, permissions, is_admin FROM role_mappings ORDER BY idp_role`
      );
      const roles = result.rows.map((row: any) => ({
        idp_role: row.idp_role,
        label_key: row.label_key,
        permissions: row.permissions ?? [],
        is_admin: row.is_admin || false,
      }));
      res.json({ roles });
    })
  );

  return router;
}
