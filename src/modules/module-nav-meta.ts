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
        route_prefixes: ["/system/customers", "/crm"],
        nav: [
          { id: "customers", label_key: "system.entities.customer.title", href: "/system/customers", icon: "users" },
          { id: "pipeline", label_key: "system.entities.crm.pipeline.nav", href: "/crm/pipeline", icon: "git-branch" },
        ],
        routes: [
          { route: "/system/customers", kind: "list", entity: "customer" },
          { route: "/system/customers/new", kind: "create", entity: "customer" },
          { route: "/crm/pipeline", kind: "page" },
        ],
      };
    case "settings":
      return {
        module: "settings",
        icon: "settings",
        route_prefixes: ["/system"],
        is_reserved: true,
        nav: [
          { id: "profile", label_key: "system.settings.tabs.profile", href: "/system/settings/profile", icon: "square-user" },
          { id: "credentials", label_key: "system.settings.tabs.credentials", href: "/system/settings/credentials", icon: "key-round" },
          { id: "organizations", label_key: "system.settings.tabs.organizations", href: "/system/settings/organizations", icon: "building-complex" },
          { id: "users", label_key: "system.settings.tabs.users", href: "/system/settings/users", icon: "users" },
          { id: "roles", label_key: "system.settings.tabs.roles", href: "/system/settings/roles", icon: "user-key" },
          { id: "configurations", label_key: "system.settings.tabs.configurations", href: "/system/settings/configurations", icon: "settings-2" },
          { id: "ai", label_key: "system.settings.tabs.ai", href: "/system/settings/ai", icon: "brain-circuit" },
          { id: "modules", label_key: "system.settings.tabs.modules", href: "/system/settings/modules", icon: "package" },
          { id: "templates", label_key: "system.settings.tabs.templates", href: "/system/settings/templates", icon: "file-text" },
          { id: "email-providers", label_key: "system.settings.tabs.emailProviders", href: "/system/settings/email-providers", icon: "mail" },
        ],
        // Full route census — every FE path this module owns, including
        // detail/create/param routes not deducible from nav links.
        routes: [
          { route: "/system/settings", kind: "page" },
          { route: "/system/settings/profile", kind: "page" },
          { route: "/system/settings/credentials", kind: "page" },
          { route: "/system/settings/organizations", kind: "list", entity: "organization" },
          { route: "/system/settings/organizations/[uuid]", kind: "detail", entity: "organization" },
          { route: "/system/settings/organizations/create", kind: "create", entity: "organization" },
          { route: "/system/settings/users", kind: "list", entity: "user_profiles" },
          { route: "/system/settings/users/[uuid]", kind: "detail", entity: "user_profiles" },
          { route: "/system/settings/users/create", kind: "create", entity: "user_profiles" },
          { route: "/system/settings/roles", kind: "list", entity: "role" },
          { route: "/system/settings/roles/[uuid]", kind: "detail", entity: "role" },
          { route: "/system/settings/roles/create", kind: "create", entity: "role" },
          { route: "/system/settings/configurations", kind: "list", entity: "config_entry" },
          { route: "/system/settings/configurations/create", kind: "create", entity: "config_entry" },
          { route: "/system/settings/ai", kind: "page" },
          { route: "/system/settings/modules", kind: "list", entity: "service_registry" },
          { route: "/system/settings/modules/[code]", kind: "detail", entity: "service_registry" },
          { route: "/system/settings/templates", kind: "list", entity: "template" },
          { route: "/system/settings/translations", kind: "page" },
          { route: "/system/settings/email-providers", kind: "list", entity: "email_provider" },
        ],
      };
    default:
      return null;
  }
}
