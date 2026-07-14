import { describe, it, expect, beforeEach } from "vitest";
import {
  entityRegistry,
  registerBeEntities,
  type BeEntityConfig,
  type ProxyEntityConfig,
} from "../tools/entity-registry.js";

describe("EntityRegistry", () => {
  beforeEach(() => {
    entityRegistry.clear();
  });

  describe("registerBeEntity", () => {
    it("registers a BE entity with in-process handler type", () => {
      const config: BeEntityConfig = {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list", "get", "create"],
        permissions: {},
      };
      entityRegistry.registerBeEntity("be", config);

      const entry = entityRegistry.get("be", "customer");
      expect(entry).toBeDefined();
      expect(entry?.handler_type).toBe("in-process");
      expect(entry?.entity).toBe("customer");
      expect(entry?.label).toBe("Customer");
      expect(entry?.supported_operations).toEqual(["list", "get", "create"]);
      expect(entry?.supported_bulk_operations).toEqual([]);
      expect(entry?.permissions).toEqual({});
    });

    it("registers bulk operations when provided", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list", "delete", "restore"],
        supported_bulk_operations: ["bulk_delete", "bulk_restore"],
        permissions: {},
      });

      const entry = entityRegistry.get("be", "customer");
      expect(entry?.supported_bulk_operations).toEqual(["bulk_delete", "bulk_restore"]);
    });

    it("defaults supported_bulk_operations to empty array when omitted", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "organization",
        label: "Organization",
        supported_operations: ["list"],
        permissions: {},
      });

      const entry = entityRegistry.get("be", "organization");
      expect(entry?.supported_bulk_operations).toEqual([]);
    });
  });

  describe("registerProxyEntity", () => {
    it("registers a microservice entity with proxy handler type", () => {
      const config: ProxyEntityConfig = {
        entity: "providers",
        label: "Email Providers",
        supported_operations: ["list", "get", "create", "update", "delete"],
      };
      entityRegistry.registerProxyEntity("emailsender", config);

      const entry = entityRegistry.get("emailsender", "providers");
      expect(entry).toBeDefined();
      expect(entry?.handler_type).toBe("proxy");
      expect(entry?.module).toBe("emailsender");
      expect(entry?.entity).toBe("providers");
      expect(entry?.supported_bulk_operations).toEqual([]);
      expect(entry?.permissions).toBeUndefined();
    });
  });

  describe("get", () => {
    it("returns undefined for unknown (module, entity)", () => {
      expect(entityRegistry.get("be", "nonexistent")).toBeUndefined();
      expect(entityRegistry.get("unknown", "customer")).toBeUndefined();
    });

    it("returns the entry for a registered (module, entity)", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list"],
        permissions: {},
      });

      const entry = entityRegistry.get("be", "customer");
      expect(entry?.module).toBe("be");
      expect(entry?.entity).toBe("customer");
    });
  });

  describe("supportsOperation", () => {
    it("returns true for supported operations", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list", "get", "create"],
        permissions: {},
      });

      expect(entityRegistry.supportsOperation("be", "customer", "list")).toBe(true);
      expect(entityRegistry.supportsOperation("be", "customer", "get")).toBe(true);
      expect(entityRegistry.supportsOperation("be", "customer", "create")).toBe(true);
    });

    it("returns false for unsupported operations", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list"],
        permissions: {},
      });

      expect(entityRegistry.supportsOperation("be", "customer", "delete")).toBe(false);
      expect(entityRegistry.supportsOperation("be", "customer", "restore")).toBe(false);
    });

    it("returns false for unknown entities", () => {
      expect(entityRegistry.supportsOperation("be", "nonexistent", "list")).toBe(false);
    });
  });

  describe("listByModule", () => {
    it("returns all entries for a given module", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list"],
        permissions: {},
      });
      entityRegistry.registerBeEntity("be", {
        entity: "organization",
        label: "Organization",
        supported_operations: ["list"],
        permissions: {},
      });
      entityRegistry.registerProxyEntity("emailsender", {
        entity: "providers",
        label: "Providers",
        supported_operations: ["list"],
      });

      const beEntries = entityRegistry.listByModule("be");
      expect(beEntries).toHaveLength(2);
      expect(beEntries.map((e) => e.entity).sort()).toEqual(["customer", "organization"]);

      const msEntries = entityRegistry.listByModule("emailsender");
      expect(msEntries).toHaveLength(1);
      expect(msEntries[0].entity).toBe("providers");
    });

    it("returns empty array for unknown module", () => {
      expect(entityRegistry.listByModule("unknown")).toEqual([]);
    });
  });

  describe("listModules", () => {
    it("groups entries by module", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list"],
        permissions: {},
      });
      entityRegistry.registerProxyEntity("emailsender", {
        entity: "providers",
        label: "Providers",
        supported_operations: ["list"],
      });
      entityRegistry.registerProxyEntity("emailsender", {
        entity: "config",
        label: "Config",
        supported_operations: ["list"],
      });

      const modules = entityRegistry.listModules();
      expect(modules).toHaveLength(2);

      const beModule = modules.find((m) => m.module === "be");
      expect(beModule?.entities).toHaveLength(1);
      expect(beModule?.entities[0].entity).toBe("customer");

      const msModule = modules.find((m) => m.module === "emailsender");
      expect(msModule?.entities).toHaveLength(2);
      expect(msModule?.entities.map((e) => e.entity).sort()).toEqual(["config", "providers"]);
    });
  });

  describe("unregisterModule", () => {
    it("removes all entries for a module", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list"],
        permissions: {},
      });
      entityRegistry.registerProxyEntity("emailsender", {
        entity: "providers",
        label: "Providers",
        supported_operations: ["list"],
      });
      entityRegistry.registerProxyEntity("emailsender", {
        entity: "config",
        label: "Config",
        supported_operations: ["list"],
      });

      entityRegistry.unregisterModule("emailsender");

      expect(entityRegistry.get("emailsender", "providers")).toBeUndefined();
      expect(entityRegistry.get("emailsender", "config")).toBeUndefined();
      expect(entityRegistry.get("be", "customer")).toBeDefined();
    });

    it("does nothing for unknown module", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list"],
        permissions: {},
      });

      entityRegistry.unregisterModule("unknown");
      expect(entityRegistry.get("be", "customer")).toBeDefined();
    });
  });

  describe("clear", () => {
    it("removes all entries", () => {
      entityRegistry.registerBeEntity("be", {
        entity: "customer",
        label: "Customer",
        supported_operations: ["list"],
        permissions: {},
      });

      entityRegistry.clear();
      expect(entityRegistry.get("be", "customer")).toBeUndefined();
      expect(entityRegistry.listModules()).toEqual([]);
    });
  });

  describe("registerBeEntities (static registration)", () => {
    it("registers customer, organization, and user_profiles", () => {
      registerBeEntities();

      const customer = entityRegistry.get("be", "customer");
      expect(customer).toBeDefined();
      expect(customer?.label).toBe("Customer");
      expect(customer?.handler_type).toBe("in-process");
      expect(customer?.supported_operations).toContain("list");
      expect(customer?.supported_operations).toContain("create");
      expect(customer?.supported_operations).toContain("delete");
      expect(customer?.supported_bulk_operations).toContain("bulk_delete");
      expect(customer?.permissions?.list).toBeDefined();

      const organization = entityRegistry.get("be", "organization");
      expect(organization).toBeDefined();
      expect(organization?.label).toBe("Organization");
      expect(organization?.supported_operations).toContain("list");
      expect(organization?.supported_operations).toContain("create");

      const userProfiles = entityRegistry.get("be", "user_profiles");
      expect(userProfiles).toBeDefined();
      expect(userProfiles?.label).toBe("User Profile");
      // user_profiles does NOT support create
      expect(userProfiles?.supported_operations).not.toContain("create");
      expect(userProfiles?.supported_operations).toContain("update");
    });

    it("is idempotent (calling twice does not duplicate entries)", () => {
      registerBeEntities();
      registerBeEntities();

      const beEntries = entityRegistry.listByModule("be");
      expect(beEntries).toHaveLength(3);
    });
  });
});
