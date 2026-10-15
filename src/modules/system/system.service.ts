/**
 * SystemService — business logic for the `system` module endpoints.
 *
 * Owns: active-organizations sidebar DTO, role dropdown list, permission
 * catalog grouping, password-policy resolution, and service-registry admin
 * operations (read/toggle/delete/update).
 *
 * The service is request-context-free: it never touches `req`/`res`.
 * Errors are thrown as `ApiError` subclasses so the centralized
 * `errorHandler` converts them to RFC 7807 JSON.
 */

import { listNonSentinelPermissions } from "@primebrick/sdk";

import { NotFoundError } from "../../http/api-errors.js";
import { OrganizationsService } from "../auth/services/organizations.service.js";
import { RoleMappingRepo } from "../auth/role-mapping-repo.js";
import { loadAuthConfigFromDb } from "../auth/config-repo.js";
import { ServiceRegistryService } from "./service-registry.service.js";
import {
  parsePasswordPolicy,
  getPasswordPolicyConfig,
  PASSWORD_SPECIAL_CHARS,
} from "../auth/password-policy.js";

export class SystemService {
  /**
   * Active organizations mapped to the minimal sidebar-switcher DTO.
   */
  async listActiveOrganizations() {
    const svc = new OrganizationsService();
    const result = await svc.listOrganizations({
      page: 1,
      page_size: 100,
      deleted_records: "EXCLUDED",
    });
    const orgs = result.rows.map((org) => ({
      uuid: org.uuid,
      idp_code: org.idp_code,
      idp_name: org.idp_name,
      display_name: org.display_name,
      avatar: org.avatar ?? null,
    }));
    return { organizations: orgs };
  }

  /**
   * Available IdP roles for form dropdowns, sorted by role code.
   */
  async listActiveRoles() {
    const repo = new RoleMappingRepo();
    const roleMap = await repo.loadAllMappings();
    const roles = Array.from(roleMap.entries())
      .map(([idp_role, mapping]) => ({
        idp_role,
        label_key: mapping.label_key,
        permissions: mapping.permissions ?? [],
        is_admin: mapping.is_admin || false,
      }))
      .sort((a, b) => a.idp_role.localeCompare(b.idp_role));
    return { roles };
  }

  /**
   * Full non-sentinel permission catalog grouped by module prefix.
   * Pure SDK data — no DB access.
   */
  listPermissionsCatalog() {
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
        label_key: `system.settings.roles.permissions.module.${code}`,
        permissions: perms.sort().map((code2) => ({
          code: code2,
          label_key: `system.settings.roles.permissions.${code2}`,
        })),
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
    return { modules };
  }

  /**
   * Active password policy resolved for FE form rendering.
   */
  async getPasswordPolicy() {
    const cfg = await loadAuthConfigFromDb();
    const policy = parsePasswordPolicy(cfg.password_policy!);
    const config = getPasswordPolicyConfig(policy);
    return {
      policy,
      errorLabelKey: config.errorLabelKey,
      checklistRules: config.checklistRules,
      specialChars: PASSWORD_SPECIAL_CHARS,
    };
  }

  /**
   * All registered microservices with health status.
   */
  async listServices() {
    const services = await new ServiceRegistryService().findAll();
    return { services };
  }

  /**
   * Single service by code. Throws NotFoundError when missing.
   */
  async getService(code: string) {
    const service = await new ServiceRegistryService().findByCode(code);
    if (!service) {
      throw new NotFoundError(`Service '${code}' not found`, {
        internal_code: "SERVICE_NOT_FOUND",
      });
    }
    return { service };
  }

  /**
   * Toggle `is_enabled` for a service. Throws NotFoundError when missing.
   */
  async toggleService(code: string) {
    const registry = new ServiceRegistryService();
    const existing = await registry.findByCode(code);
    if (!existing) {
      throw new NotFoundError(`Service '${code}' not found`, {
        internal_code: "SERVICE_NOT_FOUND",
      });
    }
    const newEnabled = !existing.is_enabled;
    await registry.toggleEnabled(code, newEnabled);
    return { code, is_enabled: newEnabled };
  }

  /**
   * Hard delete a service from the registry. Throws NotFoundError when missing.
   */
  async deleteService(code: string) {
    const registry = new ServiceRegistryService();
    const existing = await registry.findByCode(code);
    if (!existing) {
      throw new NotFoundError(`Service '${code}' not found`, {
        internal_code: "SERVICE_NOT_FOUND",
      });
    }
    await registry.hardDeleteByCode(code);
    return { code, deleted: true };
  }

  /**
   * Hard delete a single registry instance by uuid. Deleting the row also
   * releases its schema claim (claims live on the row itself).
   */
  async deleteServiceInstance(uuid: string) {
    const registry = new ServiceRegistryService();
    const existing = await registry.findByUuid(uuid);
    if (!existing) {
      throw new NotFoundError(`Service instance '${uuid}' not found`, {
        internal_code: "SERVICE_NOT_FOUND",
      });
    }
    await registry.hardDeleteByUuid(uuid);
    return { uuid, code: existing.code, deleted: true };
  }

  /**
   * Update service_registry admin fields and return the updated row.
   */
  async updateService(
    code: string,
    fields: {
      name?: string;
      description?: string;
      base_url?: string;
      icon?: string;
      icon_type?: string;
      author?: string;
      github_repo_url?: string;
    },
  ) {
    const registry = new ServiceRegistryService();
    await registry.updateByCodeAdmin(code, fields);
    const service = await registry.findByCode(code);
    return { service };
  }
}
