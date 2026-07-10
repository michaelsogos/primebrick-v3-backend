import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { asyncHandler } from "../../http/async-handler.js";
import { getPool } from "../../db/pool.js";
import { OrganizationsDal } from "../auth/organizations_dal.js";
import { RoleMappingRepo } from "../auth/role-mapping-repo.js";
import { loadAuthConfigFromDb } from "../auth/config-repo.js";
import {
  parsePasswordPolicy,
  getPasswordPolicyConfig,
  PASSWORD_SPECIAL_CHARS,
} from "../auth/password-policy.js";

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
      const repo = new RoleMappingRepo(getPool());
      const roleMap = await repo.loadAllMappings();
      const roles = Array.from(roleMap.entries())
        .map(([idp_role, mapping]) => ({
          idp_role,
          label_key: mapping.label_key,
          permissions: mapping.permissions ?? [],
          is_admin: mapping.is_admin || false,
        }))
        .sort((a, b) => a.idp_role.localeCompare(b.idp_role));
      res.json({ roles });
    })
  );

  // GET /api/v1/system/password-policy - Active password policy for FE forms
  router.get(
    "/api/v1/system/password-policy",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      const cfg = await loadAuthConfigFromDb(getPool());
      const policy = parsePasswordPolicy(cfg.password_policy!);
      const config = getPasswordPolicyConfig(policy);
      res.json({
        policy,
        errorLabelKey: config.errorLabelKey,
        checklistRules: config.checklistRules,
        specialChars: PASSWORD_SPECIAL_CHARS,
      });
    })
  );

  return router;
}
