import { describe, it, expect } from "vitest";
import { discoverEntitiesFromSpec } from "../tools/openapi-discovery.js";

describe("OpenAPI Entity Discovery", () => {
  describe("discoverEntitiesFromSpec", () => {
    it("discovers entities from a standard OpenAPI spec", () => {
      const spec = {
        openapi: "3.1.0",
        info: { title: "Test", version: "1.0.0" },
        tags: [
          { name: "providers", description: "Email provider configuration entities" },
          { name: "config_entries", description: "Module configuration key-value entries" },
        ],
        paths: {
          "/api/v1/entities/providers/meta": {
            get: { operationId: "get_providers_meta", tags: ["providers"] },
          },
          "/api/v1/entities/providers/list": {
            get: { operationId: "list_providers", tags: ["providers"] },
          },
          "/api/v1/entities/providers/{uuid}": {
            get: { operationId: "get_provider", tags: ["providers"] },
            put: { operationId: "update_provider", tags: ["providers"] },
            delete: { operationId: "delete_provider", tags: ["providers"] },
          },
          "/api/v1/entities/providers": {
            post: { operationId: "create_provider", tags: ["providers"] },
          },
        },
      };

      const entities = discoverEntitiesFromSpec(spec);

      expect(entities).toHaveLength(1);
      expect(entities[0].entity).toBe("providers");
      expect(entities[0].label).toBe("Email provider configuration entities");
      expect(entities[0].supported_operations).toContain("list");
      expect(entities[0].supported_operations).toContain("get");
      expect(entities[0].supported_operations).toContain("create");
      expect(entities[0].supported_operations).toContain("update");
      expect(entities[0].supported_operations).toContain("delete");
      expect(entities[0].supported_operations).toContain("meta");
    });

    it("discovers multiple entities", () => {
      const spec = {
        paths: {
          "/api/v1/entities/providers/list": {
            get: { tags: ["providers"] },
          },
          "/api/v1/entities/providers/{uuid}": {
            get: { tags: ["providers"] },
            put: { tags: ["providers"] },
            delete: { tags: ["providers"] },
          },
          "/api/v1/entities/providers": {
            post: { tags: ["providers"] },
          },
          "/api/v1/entities/config_entries/list": {
            get: { tags: ["config_entries"] },
          },
          "/api/v1/entities/config_entries/{uuid}": {
            get: { tags: ["config_entries"] },
            put: { tags: ["config_entries"] },
          },
          "/api/v1/entities/config_entries/meta": {
            get: { tags: ["config_entries"] },
          },
        },
        tags: [
          { name: "providers", description: "Email providers" },
          { name: "config_entries", description: "Config entries" },
        ],
      };

      const entities = discoverEntitiesFromSpec(spec);

      expect(entities).toHaveLength(2);
      const providers = entities.find((e) => e.entity === "providers");
      const configEntries = entities.find((e) => e.entity === "config_entries");

      expect(providers).toBeDefined();
      expect(providers!.supported_operations).toContain("list");
      expect(providers!.supported_operations).toContain("create");
      expect(providers!.supported_operations).toContain("delete");

      expect(configEntries).toBeDefined();
      expect(configEntries!.supported_operations).toContain("list");
      expect(configEntries!.supported_operations).toContain("get");
      expect(configEntries!.supported_operations).toContain("update");
      expect(configEntries!.supported_operations).toContain("meta");
      // config_entries has no POST or DELETE
      expect(configEntries!.supported_operations).not.toContain("create");
      expect(configEntries!.supported_operations).not.toContain("delete");
    });

    it("ignores non-entity paths (webhooks, actions, system)", () => {
      const spec = {
        paths: {
          "/webhook": {
            post: { tags: ["webhook"] },
          },
          "/api/v1/actions/send-email": {
            post: { tags: ["actions"] },
          },
          "/api/v1/openapi.json": {
            get: {},
          },
          "/health": {
            get: {},
          },
        },
      };

      const entities = discoverEntitiesFromSpec(spec);
      expect(entities).toHaveLength(0);
    });

    it("discovers restore and audit operations", () => {
      const spec = {
        paths: {
          "/api/v1/entities/customers/list": {
            get: { tags: ["customers"] },
          },
          "/api/v1/entities/customers/{uuid}": {
            get: { tags: ["customers"] },
            put: { tags: ["customers"] },
            delete: { tags: ["customers"] },
          },
          "/api/v1/entities/customers": {
            post: { tags: ["customers"] },
          },
          "/api/v1/entities/customers/{uuid}/restore": {
            post: { tags: ["customers"] },
          },
          "/api/v1/entities/customers/{uuid}/audit": {
            get: { tags: ["customers"] },
          },
          "/api/v1/entities/customers/meta": {
            get: { tags: ["customers"] },
          },
        },
        tags: [{ name: "customers", description: "Customer entities" }],
      };

      const entities = discoverEntitiesFromSpec(spec);

      expect(entities).toHaveLength(1);
      expect(entities[0].entity).toBe("customers");
      expect(entities[0].supported_operations).toContain("list");
      expect(entities[0].supported_operations).toContain("get");
      expect(entities[0].supported_operations).toContain("create");
      expect(entities[0].supported_operations).toContain("update");
      expect(entities[0].supported_operations).toContain("delete");
      expect(entities[0].supported_operations).toContain("restore");
      expect(entities[0].supported_operations).toContain("audit");
      expect(entities[0].supported_operations).toContain("meta");
    });

    it("handles empty spec", () => {
      const entities = discoverEntitiesFromSpec({});
      expect(entities).toHaveLength(0);
    });

    it("handles spec with no entity paths", () => {
      const spec = {
        paths: {
          "/webhook": { post: {} },
          "/health": { get: {} },
        },
      };
      const entities = discoverEntitiesFromSpec(spec);
      expect(entities).toHaveLength(0);
    });

    it("uses tag name as label when description is missing", () => {
      const spec = {
        paths: {
          "/api/v1/entities/items/list": {
            get: { tags: ["items"] },
          },
        },
        tags: [{ name: "items" }], // no description
      };

      const entities = discoverEntitiesFromSpec(spec);
      expect(entities).toHaveLength(1);
      expect(entities[0].label).toBe("items");
    });

    it("uses entity name as label when no tags are present", () => {
      const spec = {
        paths: {
          "/api/v1/entities/items/list": {
            get: {}, // no tags
          },
        },
      };

      const entities = discoverEntitiesFromSpec(spec);
      expect(entities).toHaveLength(1);
      expect(entities[0].label).toBe("items");
    });
  });
});
