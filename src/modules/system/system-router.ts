import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission, listNonSentinelPermissions } from "@primebrick/sdk";
import { asyncHandler } from "../../http/async-handler.js";
import { getPool } from "../../db/pool.js";
import { OrganizationsDal } from "../auth/organizations_dal.js";
import { RoleMappingRepo } from "../auth/role-mapping-repo.js";
import { loadAuthConfigFromDb } from "../auth/config-repo.js";
import { ServiceRegistryRepo } from "../proxy/service-registry-repo.js";
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

  // GET /api/v1/system/permissions - Full non-sentinel permission catalog grouped by module
  // Used by the FE role-management form to render the Permissions tab.
  router.get(
    "/api/v1/system/permissions",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      const all = listNonSentinelPermissions();
      const modulesMap = new Map<string, string[]>();
      for (const p of all) {
        const mod = p.split(".")[0];
        if (!modulesMap.has(mod)) modulesMap.set(mod, []);
        modulesMap.get(mod)!.push(p);
      }
      const modules = Array.from(modulesMap.entries())
        .map(([code, perms]) => ({
          code,
          label_key: `shell.settings.roles.permissions.module.${code}`,
          permissions: perms.sort().map((code2) => ({
            code: code2,
            label_key: `shell.settings.roles.permissions.${code2}`,
          })),
        }))
        .sort((a, b) => a.code.localeCompare(b.code));
      res.json({ modules });
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

  // GET /api/v1/system/services - All registered microservices with health status (DB read only)
  router.get(
    "/api/v1/system/services",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (_req, res) => {
      const repo = new ServiceRegistryRepo(getPool());
      const services = await repo.findAll();
      res.json({ services });
    })
  );

  // GET /api/v1/system/services/:code - Single service by code
  router.get(
    "/api/v1/system/services/:code",
    rbacHandler([Permission.MODULES_READ_SINGLE]),
    asyncHandler(async (req, res) => {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const repo = new ServiceRegistryRepo(getPool());
      const service = await repo.findByCode(code);
      if (!service) {
        res.status(404).json({
          type: "about:blank",
          status: 404,
          title: "Not Found",
          detail: `Service '${code}' not found`,
        });
        return;
      }
      res.json({ service });
    })
  );

  // PATCH /api/v1/system/services/:code/toggle - Toggle is_enabled
  router.patch(
    "/api/v1/system/services/:code/toggle",
    rbacHandler([Permission.MODULES_UPDATE]),
    asyncHandler(async (req, res) => {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const repo = new ServiceRegistryRepo(getPool());
      const existing = await repo.findByCode(code);
      if (!existing) {
        res.status(404).json({
          type: "about:blank",
          status: 404,
          title: "Not Found",
          detail: `Service '${code}' not found`,
        });
        return;
      }
      const newEnabled = !existing.is_enabled;
      await repo.toggleEnabled(code, newEnabled);
      res.json({ code, is_enabled: newEnabled });
    })
  );

  // DELETE /api/v1/system/services/:code - Hard delete a service from registry
  router.delete(
    "/api/v1/system/services/:code",
    rbacHandler([Permission.MODULES_DELETE]),
    asyncHandler(async (req, res) => {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const repo = new ServiceRegistryRepo(getPool());
      const existing = await repo.findByCode(code);
      if (!existing) {
        res.status(404).json({
          type: "about:blank",
          status: 404,
          title: "Not Found",
          detail: `Service '${code}' not found`,
        });
        return;
      }
      await repo.hardDeleteByCode(code);
      res.json({ code, deleted: true });
    })
  );

  // PUT /api/v1/system/services/:code - Update service_registry fields (admin config)
  router.put(
    "/api/v1/system/services/:code",
    rbacHandler([Permission.MODULES_UPDATE]),
    asyncHandler(async (req, res) => {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const repo = new ServiceRegistryRepo(getPool());
      const { name, description, base_url, icon, icon_type, author, github_repo_url } = req.body;
      await repo.updateByCodeAdmin(code, {
        name,
        description,
        base_url,
        icon,
        icon_type,
        author,
        github_repo_url,
      });
      const updated = await repo.findByCode(code);
      res.json({ service: updated });
    })
  );

  return router;
}
