/**
 * Static registry of module navigation metadata.
 *
 * This is a PLACEHOLDER until microservices self-describe their nav via NATS
 * (stored in service_registry.endpoints jsonb). For now, the BE is the single
 * source of truth for module nav — including the reserved 'settings' module
 * which is a Primebrick shell constant, not a registrable microservice.
 *
 * The FE never hardcodes any of this — it fetches everything via the API.
 */

import type { ModuleNavWithPrefixes } from "./module-nav-types.js";

export function buildModuleNavMeta(code: string): ModuleNavWithPrefixes | null {
  switch (code.toLowerCase()) {
    case "crm":
      return {
        module: "crm",
        icon: "users",
        route_prefixes: ["/customers", "/crm"],
        nav: [
          { id: "customers", label_key: "entities.customer.title", href: "/customers", icon: "users" },
          { id: "pipeline", label_key: "entities.crm.pipeline.nav", href: "/crm/pipeline", icon: "git-branch" },
        ],
      };
    case "settings":
      return {
        module: "settings",
        icon: "settings",
        route_prefixes: ["/system/settings"],
        is_reserved: true,
        nav: [
          { id: "profile", label_key: "shell.settings.tabs.profile", href: "/system/settings/profile", icon: "user" },
          { id: "organizations", label_key: "shell.settings.tabs.organizations", href: "/system/settings/organizations", icon: "building-2" },
          { id: "users", label_key: "shell.settings.tabs.users", href: "/system/settings/users", icon: "users" },
          { id: "security", label_key: "shell.settings.tabs.security", href: "/system/settings/security", icon: "shield-check" },
          { id: "modules", label_key: "shell.settings.tabs.modules", href: "/system/settings/modules", icon: "package" },
          { id: "templates", label_key: "shell.settings.tabs.templates", href: "/system/settings/templates", icon: "file-text" },
          { id: "email-providers", label_key: "shell.settings.tabs.emailProviders", href: "/system/settings/email-providers", icon: "mail" },
        ],
      };
    default:
      return null;
  }
}
